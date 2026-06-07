#!/bin/bash
# Setup script for development environment
# Installs nvm, node, and pnpm with required versions

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
NODE_VERSION=$(cat "$PROJECT_ROOT/.nvmrc" | tr -d '[:space:]')
PNPM_VERSION=$(grep '"packageManager"' "$PROJECT_ROOT/package.json" | sed 's/.*pnpm@\([^"]*\).*/\1/')

log_info "Setting up development environment"
log_info "Required Node.js: $NODE_VERSION"
log_info "Required pnpm: $PNPM_VERSION"
echo ""

# Check/install nvm
if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
  log_info "nvm found, loading..."
  source "$HOME/.nvm/nvm.sh"
elif [[ -s "/opt/homebrew/opt/nvm/nvm.sh" ]]; then
  log_info "nvm found (Homebrew), loading..."
  source "/opt/homebrew/opt/nvm/nvm.sh"
elif [[ -s "/usr/local/opt/nvm/nvm.sh" ]]; then
  log_info "nvm found (Homebrew Intel), loading..."
  source "/usr/local/opt/nvm/nvm.sh"
else
  log_warn "nvm not found. Installing nvm..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  source "$NVM_DIR/nvm.sh"
  log_info "nvm installed successfully"
fi

log_info "Installing Node.js $NODE_VERSION..."
nvm install "$NODE_VERSION"
nvm use "$NODE_VERSION"

CURRENT_NODE=$(node --version)
log_info "Node.js version: $CURRENT_NODE"

log_info "Enabling corepack and installing pnpm $PNPM_VERSION..."
corepack enable
corepack prepare "pnpm@$PNPM_VERSION" --activate

CURRENT_PNPM=$(pnpm --version)
log_info "pnpm version: $CURRENT_PNPM"

# Setup shell config
setup_shell_config() {
  local shell_rc="$1"
  local shell_name="$2"

  if [[ ! -f "$shell_rc" ]]; then
    log_warn "$shell_rc not found, skipping..."
    return
  fi

  if grep -q 'NVM_DIR' "$shell_rc"; then
    log_info "nvm already configured in $shell_name"
  else
    log_info "Adding nvm to $shell_name..."
    cat >> "$shell_rc" << 'EOF'

# nvm (Node Version Manager)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
EOF
    log_info "nvm added to $shell_name"
  fi

  if grep -q 'autoload_nvmrc\|nvm use --silent' "$shell_rc"; then
    log_info "Auto-switch already configured in $shell_name"
  else
    log_info "Adding auto-switch (.nvmrc) to $shell_name..."
    cat >> "$shell_rc" << 'EOF'

# Auto-switch node version when entering directory with .nvmrc
autoload_nvmrc() {
  local nvmrc_path="$(nvm_find_nvmrc)"
  if [ -n "$nvmrc_path" ]; then
    local nvmrc_node_version=$(nvm version "$(cat "${nvmrc_path}")")
    if [ "$nvmrc_node_version" = "N/A" ]; then
      nvm install
    elif [ "$nvmrc_node_version" != "$(nvm version)" ]; then
      nvm use --silent
    fi
  fi
}

if [[ -n "$ZSH_VERSION" ]]; then
  autoload -U add-zsh-hook
  add-zsh-hook chpwd autoload_nvmrc
  autoload_nvmrc
elif [[ -n "$BASH_VERSION" ]]; then
  PROMPT_COMMAND="autoload_nvmrc${PROMPT_COMMAND:+;$PROMPT_COMMAND}"
fi
EOF
    log_info "Auto-switch added to $shell_name"
  fi
}

echo ""
log_info "Configuring shell environment..."

if [[ -f "$HOME/.zshrc" ]] || [[ "$SHELL" == *"zsh"* ]]; then
  setup_shell_config "$HOME/.zshrc" ".zshrc"
fi

if [[ -f "$HOME/.bashrc" ]]; then
  setup_shell_config "$HOME/.bashrc" ".bashrc"
fi

if [[ -f "$HOME/.bash_profile" ]] && [[ "$(uname)" == "Darwin" ]]; then
  if ! grep -q 'bashrc' "$HOME/.bash_profile" 2>/dev/null; then
    setup_shell_config "$HOME/.bash_profile" ".bash_profile"
  fi
fi

# Install and configure direnv
echo ""
log_info "Setting up direnv for automatic environment loading..."

if command -v direnv &> /dev/null; then
  log_info "direnv already installed"
else
  if [[ "$(uname)" == "Darwin" ]]; then
    if command -v brew &> /dev/null; then
      log_info "Installing direnv via Homebrew..."
      brew install direnv
    else
      log_error "Homebrew not found. Install direnv manually: https://direnv.net/docs/installation.html"
    fi
  else
    log_warn "Please install direnv manually: https://direnv.net/docs/installation.html"
  fi
fi

setup_direnv_hook() {
  local shell_rc="$1"
  local shell_name="$2"
  local hook_cmd="$3"

  if [[ ! -f "$shell_rc" ]]; then return; fi

  if grep -q 'direnv hook' "$shell_rc"; then
    log_info "direnv hook already configured in $shell_name"
  else
    log_info "Adding direnv hook to $shell_name..."
    echo "" >> "$shell_rc"
    echo "# direnv - auto-load environment from .envrc" >> "$shell_rc"
    echo "$hook_cmd" >> "$shell_rc"
    log_info "direnv hook added to $shell_name"
  fi
}

if [[ -f "$HOME/.zshrc" ]] || [[ "$SHELL" == *"zsh"* ]]; then
  setup_direnv_hook "$HOME/.zshrc" ".zshrc" 'eval "$(direnv hook zsh)"'
fi

if [[ -f "$HOME/.bashrc" ]]; then
  setup_direnv_hook "$HOME/.bashrc" ".bashrc" 'eval "$(direnv hook bash)"'
fi

if command -v direnv &> /dev/null && [[ -f "$PROJECT_ROOT/.envrc" ]]; then
  log_info "Allowing project .envrc..."
  cd "$PROJECT_ROOT" && direnv allow
fi

log_info "Setup complete!"
echo ""
echo "To apply changes now, run:  exec \$SHELL"
echo "Then install dependencies:  pnpm install"
