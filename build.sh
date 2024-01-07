# Execution script for the project
#!/bin/sh

# Installing python dependencies:
pip3 install typer
pip3 install PyInquirer
pip3 install rich
pip3 install cli-box
pip3 install aptos-sdk

update_env() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/^$1=.*/$1=$2/" .env
    else
        sed -i "s/^$1=.*/$1=$2/" .env
    fi
}
# Installing backend dependencies:
cd transaction-api
DEFAULT_VALUE="0x3b75f8a62a431bbb47f6f8341732b613f0187cbf799b5499c85194365551c0a2"
read -p "Enter the address of the account you want to use for the transaction (or press Enter for default):" module

if [ -z "$module" ]; then
  module=$DEFAULT_VALUE
fi

test -e .env || echo > .env

echo "MODULE_ADDRESS=$module" >> .env

read -p "Enter the PriavteKey:" privateKey

echo "PRIVATE_KEY=$privateKey" >> .env

echo "Updated .env file with PRIVATE_KEY=$privateKey"

cd ..
# Installing frontend dependencies:
cd frontend
yarn

# env variables input

read -p "Enter the new value (or press Enter for default): " value

if [ -z "$value" ]; then
  value=$DEFAULT_VALUE
fi

update_env "VITE_APP_MODULE_ADDRESS" "$value"

echo "Updated .env file with VITE_APP_MODULE_ADDRESS=$value"

# check if user wants to open the dapp
echo "Do you want to run dapp (yes/no)"?
read varname

if [ $varname == 'yes' ]; then
    echo "running dapp"
    yarn dev
else 
    cd ..
    echo "To run the dapp: cd frontend && yarn dev"
fi