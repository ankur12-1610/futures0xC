## Transaction API
- Create `.env` file in this directory and store `PRIVATE_KEY` and `MODULE_ADDRESS`
- For details `python3 order-exec.py --help`

### Check Balance
```
python3 order-exec.py checkbalance
```
prints out the available Aptos Coin available in your account
### Buy Order (Limit Price)
```
python3 order-exec.py buyatlimitorder lvg qty price
```
Places a buy order at the limit price from your account
### Sell Order (Limit Price)
```
python3 order-exec.py sellatlimitorder lvg qty price
```
Places a sell order at the limit price from your account

### Sell Order (Market Price)
```
python3 order-exec.py sellatmarketorder lvg qty
```
Places a sell order at the market price from your account

### Buy Order (Market Price)
```
python3 order-exec.py buyatmarketorder lvg qty
```
Places a buy order at the market price from your account 

### Check For Margin Call
```
python3 order-exec.py checkformargincall 
```
Checks whether there is a margincall or not
### Deposit Margin
```
python3 order-exec.py depositmargin amt
```
Deposits amount to the wallet inorder to avoid autoliquidation of the position
### Exit Position
```
python3 order-exec.py exitposition timestamp lvg pos qty price
```
Exits the specific position of user

>Note: here `pos` is either `buy` or `sell`, so pass it as `buy` or `sell`, passing it as `buy` will exit the buy position and vice-versa.

### Exit Order
```
python3 order-exec.py exitorder timestamp lvg pos qty price
```
Exits the specific order of user

>Note: here `pos` is either "bid" or "ask", so pass it as `bid` or `ask`, passing it as `buy` will exit the buy order and vice-versa.

