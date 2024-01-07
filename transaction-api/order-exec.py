from aptos_sdk.account import Account
from aptos_sdk.async_client import FaucetClient, RestClient, EntryFunction, TransactionPayload, Serializer, TransactionArgument
import os
import asyncio
import typer
from rich import print as rprint
import subprocess
from dotenv import load_dotenv
import os
import cli_box
import json, requests
from datetime import datetime

load_dotenv()

app = typer.Typer()

NODE_URL = os.getenv("APTOS_NODE_URL", "https://fullnode.devnet.aptoslabs.com/v1")
FAUCET_URL = os.getenv(
    "APTOS_FAUCET_URL",
    "https://faucet.devnet.aptoslabs.com",
)  

rest_client = RestClient(NODE_URL)

def underline_text(text):
    return "\033[4m" + text + "\033[0m"

async def call_aptos_function(user ,module, function, type_args, args):
    payload = EntryFunction.natural(
            f"{contract_address}::{module}",
            function,
            type_args,
            args,
        )
    txn = await rest_client.create_bcs_signed_transaction(user, TransactionPayload(payload))
    resp = await rest_client.submit_bcs_transaction(txn)
    await rest_client.wait_for_transaction(resp)
    
    print(f"Your tx_hash link: " + underline_text(f"https://explorer.aptoslabs.com/txn/{resp}/userTxnOverview?network=devnet"))
    return resp

contract_address = os.environ['MODULE_ADDRESS']
private_key = os.environ['PRIVATE_KEY']
me = Account.load_key(private_key)

url = f"https://fullnode.devnet.aptoslabs.com/v1/accounts/{contract_address}/events/{contract_address}::Orderbook::Resource/margin_call_event?limit=100";


async def exitAll():
    await call_aptos_function(me, "Orderbook", "Exit_all", [], [])

async def buyLim(lvg, qty, price, private_key, stoploss):
    await call_aptos_function(me, "Orderbook", "buyAtlimitorder", [], [TransactionArgument(lvg, Serializer.u64),TransactionArgument(qty, Serializer.u64), TransactionArgument(price, Serializer.u64), TransactionArgument(stoploss, Serializer.u64)])

async def sellLim(lvg, qty, price, private_key, stoploss):
    await call_aptos_function(me, "Orderbook", "sellAtlimitorder", [], [TransactionArgument(lvg, Serializer.u64),TransactionArgument(qty, Serializer.u64), TransactionArgument(price, Serializer.u64), TransactionArgument(stoploss, Serializer.u64)])

async def buyMarket(lvg, qty, private_key, stoploss):
    await call_aptos_function(me, "Orderbook", "buyAtMarketorder", [], [TransactionArgument(lvg, Serializer.u64),TransactionArgument(qty, Serializer.u64), TransactionArgument(stoploss, Serializer.u64)])

async def sellMarket(lvg, qty, private_key, stoploss):
    await call_aptos_function(me, "Orderbook", "sellAtMarketorder", [], [TransactionArgument(lvg, Serializer.u64),TransactionArgument(qty, Serializer.u64), TransactionArgument(stoploss, Serializer.u64)])

async def depositMargin(amt):
    await call_aptos_function(me, "Orderbook", "deposit_margin", [], [TransactionArgument(amt, Serializer.u64)]);

async def exitOrder(timestamp, lvg, bid, qty, price):
    await call_aptos_function(me, "Orderbook", "exitOrder", [], [TransactionArgument(timestamp, Serializer.u64), TransactionArgument(lvg, Serializer.u64), TransactionArgument(bid, Serializer.bool), TransactionArgument(qty, Serializer.u64), TransactionArgument(price, Serializer.u64)]);

async def exitPos(timestamp, lvg, buy, qty, price):
    await call_aptos_function(me, "Orderbook", "exitPosition", [], [TransactionArgument(timestamp, Serializer.u64), TransactionArgument(lvg, Serializer.u64), TransactionArgument(buy, Serializer.bool), TransactionArgument(qty, Serializer.u64), TransactionArgument(price, Serializer.u64)]);

def stoplossValidator(stoploss):
    print(f"Do you want to add stoploss? (y/n)")
    
    ans = input()

    if ans == 'y':
        print(f"Enter the stoploss amount:")
        stoploss = input()
    elif ans == 'n':
        stoploss = 0
    else:
        print(f"Please enter y or n")
        stoploss = -1
    return stoploss

@app.command()
def checkForMarginCall():
    res = requests.get(url)
    response = json.loads(res.text)
    # print(me.address())
    for x in response[::-1]:
        user_data = x["data"]
        if(user_data["user_address"] == me.address()):
            cur = x["data"]
            timestamp_microseconds = int(cur["timestamp"])
            timestamp_seconds = timestamp_microseconds / 1_000_000
            date_object = datetime.utcfromtimestamp(timestamp_seconds)
            formatted_date = date_object.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]
            print(cli_box.rounded(f"Last margin call at: {formatted_date} UTC\nAmount to deposit: {cur['margin_depleted']}"))
            return

    print(cli_box.rounded("No margin needed"))   

@app.command()
def exitorder(timestamp: int, lvg: int, bid: str, qty: int, price: int):
    if bid=='bid':
        bid=True
    elif bid=='ask':
        bid=False
    else:
        print(f"Please type either 'bid' or 'ask' !!!")
        return
    
    asyncio.run(exitOrder(timestamp, lvg, bid, qty, price))

@app.command()
def exitposition(timestamp: int, lvg: int, buy: str, qty: int, price: int):
    if buy=='buy':
        buy=True
    elif buy=='sell':
        buy=False
    else:
        print(f"Please type either 'buy' or 'sell' !!!")
        return
    
    asyncio.run(exitPos(timestamp, lvg, buy, qty, price))

@app.command()
def depositmargin(amt: int):
    asyncio.run(depositMargin(amt));
    print(cli_box.rounded(f"Amount Deposited to {me.address()}"))

@app.command()
def exitall():
    asyncio.run(exitAll());

@app.command()
def buyatlimitorder(lvg: int, qty: int, price: int, private_key: str = private_key, stoploss: int = 0):
    stoploss = int(stoplossValidator(stoploss))
    if stoploss == -1:
        return
    asyncio.run(buyLim(lvg, qty, price, private_key, stoploss))
    print(cli_box.rounded(f"Order Details: \nLevearage: {lvg}x\nQuantity: {qty}\nLimit Price: {price}"))

@app.command()
def sellatlimitorder(lvg: int, qty: int, price: int, private_key: str = private_key, stoploss: int=0):
    stoploss = int(stoplossValidator(stoploss))
    if stoploss==-1:
        return
    elif stoploss == 0:
        stoploss = 18446744073709551615
    asyncio.run(sellLim(lvg, qty, price, private_key, stoploss))
    print(cli_box.rounded(f"Order Details: \nLevearage: {lvg}x\nQuantity: {qty}\nLimit Price: {price}"))

@app.command()
def buyatmarketorder(lvg: int, qty: int, private_key: str = private_key, stoploss: int = 0):
    stoploss = int(stoplossValidator(stoploss))
    if stoploss==-1:
        return    
    asyncio.run(buyMarket(lvg, qty, private_key, stoploss))
    print(cli_box.rounded(f"Order Details: \nLevearage: {lvg}x\nQuantity: {qty}"))

@app.command()
def sellatmarketorder(lvg: int, qty: int, private_key: str = private_key, stoploss: int = 0):
    stoploss = int(stoplossValidator(stoploss))
    if stoploss==-1:
        return 
    elif stoploss == 0:
        stoploss = 18446744073709551615
    asyncio.run(sellMarket(lvg, qty, private_key, stoploss))
    print(cli_box.rounded(f"Order Details: \n Levearage: {lvg}x\nQuantity: {qty}"))

@app.command()
def checkbalance():
    print(f"Wallet Balance: {asyncio.run(rest_client.account_balance(me.address()))/pow(10, 8)} APT")

if __name__ == '__main__':
    asyncio.run(app())
