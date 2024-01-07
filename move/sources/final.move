module Team18::Orderbook {
    use std::signer;
    use aptos_std::table::{Self,Table};
    use std::string::{Self};
    use std::vector;
    use aptos_framework::resource_account;
    use aptos_framework::account;
    use aptos_framework::coin::{Self, Coin, MintCapability, BurnCapability};
    use aptos_framework::aptos_coin::{AptosCoin};
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use std::debug;
    use std::simple_map::{SimpleMap,Self};

    struct Resource has key {
        
        bids: vector<User>,
        asks: vector<User>,
        buyers:vector<User>,
        sellers:vector<User>, 
        mktdpthbuyer:SimpleMap<u64,u64>,
        mktdpthseller:SimpleMap<u64,u64>,
        margin_call_event: event::EventHandle<Margin_call>,
        start_time:u64,
    }

    struct User has store ,copy,drop{
        lvg:u64,
        stock_price:u64,
        qty:u64,
        user_address: address,
        pos:bool,
        timestamp:u64,
        StopLoss:u64,
    }
    struct SignerCapability has key {
        resource_signer_cap : account::SignerCapability,
    }
    struct DexOrderBook has key {
        
        burn_cap: BurnCapability<Xcoin>,
        mint_cap: MintCapability<Xcoin>,
        set_ltp_event: event::EventHandle<LTPEvent>,
        bids: vector<Order>,
        asks: vector<Order>,
        ltp: u64,
    }

    struct Order has store,drop,copy {
        price: u64,
        qty: u64,
        user_address: address,
    }

    struct Xcoin {}

    #[event]
    struct LTPEvent has store,drop {
        ltp: u64,
        timestamp: u64,
    }

 

    fun giving_futures_price(price:u64):u64 acquires Resource
    {
        let resource=borrow_global_mut<Resource>(@Team18);
        let now_time=timestamp::now_microseconds();
        if ( resource.start_time + 86400000000 < now_time ) {
            return price
        }else{
           price =  (price+(price*(resource.start_time+86400000000-now_time))/((10)*(86400000000)));
           return price
        };
        return price

    }

    fun init_module(account : &signer) {

        let resource_signer_cap =  resource_account::retrieve_resource_account_cap(account, @source_addr);
        
        
        move_to(account, Resource {

            buyers:vector::empty<User>(),
            sellers:vector::empty<User>(),
            bids: vector::empty<User>(),
            asks: vector::empty<User>(),
            mktdpthbuyer:simple_map::create(),
            mktdpthseller:simple_map::create(),
            margin_call_event: account::new_event_handle<Margin_call>(account),
            start_time:timestamp::now_microseconds(),

        });
        let (burn_cap, freeze_cap, mint_cap) = coin::initialize<Xcoin>(
            account,
            string::utf8(b"X's Coin"),
            string::utf8(b"XCOIN"),
            8,
            false,
        );
        move_to(account, DexOrderBook {

            burn_cap,
            mint_cap,
            set_ltp_event: account::new_event_handle<LTPEvent>(account),
            bids: vector::empty<Order>(),
            asks: vector::empty<Order>(),
            ltp: 0,
        });
        move_to(account, SignerCapability {
            resource_signer_cap,
        });

        coin::destroy_freeze_cap(freeze_cap);

        coin::register<AptosCoin>(account);
        coin::register<Xcoin>(account);

    }



    public fun mergeMap(v: &mut vector<u64>, left: u64, mid: u64, right: u64) {
        let subArrayOne = mid + 1 - left;
        let subArrayTwo = right - mid;

        let lv = vector::empty<u64>();
        let rv = vector::empty<u64>();

        let i=0;

        while(i < subArrayOne) {
            vector::push_back(&mut lv, *vector::borrow(v, left + i));
            i = i + 1;
        };

        i=0;

        while(i < subArrayTwo) {
            vector::push_back(&mut rv, *vector::borrow(v, mid + 1 + i));
            i = i + 1;
        };

        let indexOfSubArrayOne = 0;
        let indexOfSubArrayTwo = 0;
        let indexOfMergedArray = left;

        while (indexOfSubArrayOne < subArrayOne && indexOfSubArrayTwo < subArrayTwo) {
                let a = vector::borrow(&lv, indexOfSubArrayOne);

                let b = vector::borrow(&rv, indexOfSubArrayTwo);

                let cur = vector::borrow_mut(v, indexOfMergedArray);

                if(*a <= *b) {
                    *cur = *a;
                    indexOfSubArrayOne = indexOfSubArrayOne + 1;
                } else {
                    *cur = *b;
                    indexOfSubArrayTwo = indexOfSubArrayTwo + 1;
                };

                indexOfMergedArray = indexOfMergedArray + 1;
        };

        while (indexOfSubArrayOne < subArrayOne) {
            let cur = vector::borrow_mut(v, indexOfMergedArray);
            let a = vector::borrow(&lv, indexOfSubArrayOne);

            *cur = *a;

            indexOfSubArrayOne = indexOfSubArrayOne + 1;
            indexOfMergedArray = indexOfMergedArray + 1;
        };

        while (indexOfSubArrayTwo < subArrayTwo) {
            let cur = vector::borrow_mut(v, indexOfMergedArray);
            let b = vector::borrow_mut(&mut rv, indexOfSubArrayTwo);
            
            *cur = *b;

            indexOfSubArrayTwo = indexOfSubArrayTwo + 1;
            indexOfMergedArray = indexOfMergedArray + 1;
        };
    }

    public fun mergeSortMap(v: &mut vector<u64>, begin: u64, end: u64) {
        if (begin >= end) {return};
        let mid = begin + (end - begin) / 2;
        mergeSortMap(v, begin, mid);
        mergeSortMap(v, mid + 1, end);
        mergeMap(v, begin, mid, end);
    }

    public fun sortbykey(mp: &mut SimpleMap<u64, u64>) {
            let v: &mut vector<u64> = &mut simple_map::keys<u64, u64>(mp);
  
            let l = vector::length(v);

            mergeSortMap(v, 0, l-1);

            let i=0;

            let temp: &mut SimpleMap<u64,u64> = &mut simple_map::create();   

            while(i < l) {
                let key = vector::borrow(v, i);
                let val = simple_map::borrow(mp, key);
                simple_map::add(temp, *key, *val);

                i = i+1;
            };

            i=0;

            while(i < l) {
                let key = vector::borrow(v, i);
                simple_map::remove(mp, key);
                i = i+1;
            };

            i=0;

            while(i < l) {
                let key = vector::borrow(v, i);
                let val = simple_map::borrow(temp, key);
                simple_map::add(mp, *key, *val);

                i = i+1;
            };

    }


    

    #[event]
    struct Margin_call has store,drop,copy {
        margin_needed: u64,
        user_address:address,
        timestamp: u64,
    }

    public entry fun buyAtlimitorder(account:&signer,lvg:u64,qty:u64,stock_price:u64,stop_loss:u64) acquires Resource
    {       
        let resource = borrow_global_mut<Resource>(@Team18);

        let i = vector::length(&resource.asks);
        
        if (i == 0) {
            let usr= User{
            lvg,
            stock_price,
            qty,
            user_address: signer::address_of(account),
            pos: true,
            timestamp:timestamp::now_microseconds(),
            StopLoss:stop_loss,
            };
            let aptos_coin = coin::withdraw<AptosCoin>(account, (qty*stock_price)/lvg);
            coin::deposit(@Team18, aptos_coin);
            vector::push_back(&mut resource.bids, usr);
            if(simple_map::contains_key(&mut resource.mktdpthbuyer,&usr.stock_price))
            {
                let b=simple_map::borrow_mut(&mut resource.mktdpthbuyer,&usr.stock_price);
                *b=*b+usr.qty;
            }
            else
            {
                simple_map::add(&mut resource.mktdpthbuyer,usr.stock_price,usr.qty);
            };
            
            sortbykey(&mut resource.mktdpthbuyer);



            let len = vector::length(&resource.bids);
            mergeSorta(&mut resource.bids, 0, len-1);
            return
        };
        while (i > 0) { 

            i = i - 1;
            let ask = vector::borrow_mut(&mut resource.asks, i);
            let ask_price = ask.stock_price;
            if (ask_price > stock_price) {continue};
            if (ask.qty < qty) {
                
                qty = qty - ask.qty;
                let aptos_coin = coin::withdraw<AptosCoin>(account, (ask.qty*ask.stock_price)/lvg);
                coin::deposit(@Team18, aptos_coin);
                vector::push_back(&mut resource.sellers,User{
                    qty:ask.qty,
                    stock_price:ask.stock_price,
                    user_address: ask.user_address,
                    lvg,
                    pos:true,
                    timestamp:timestamp::now_microseconds(),
                    StopLoss:ask.StopLoss,
                });

                vector::push_back(&mut resource.buyers,User{
                    qty:ask.qty,
                    stock_price:ask.stock_price,
                    user_address: signer::address_of(account),
                    lvg,
                    pos:true,
                    timestamp:timestamp::now_microseconds(),
                    StopLoss:stop_loss,
                     
                });
                let b=simple_map::borrow_mut(&mut resource.mktdpthseller,&ask.stock_price);
                *b=*b-ask.qty;
                sortbykey(&mut resource.mktdpthseller);

                vector::remove(&mut resource.asks, i);

            } 
            else {
                let x = ask.stock_price;
                
                ask.qty = ask.qty - qty;
                let aptos_coin = coin::withdraw<AptosCoin>(account, (qty*ask.stock_price)/lvg);
                coin::deposit(@Team18, aptos_coin);
                vector::push_back(&mut resource.buyers,User{
                    qty:qty,
                    stock_price:x,
                    user_address: signer::address_of(account),
                    lvg:lvg,
                    pos : true,
                    timestamp:timestamp::now_microseconds(),
                    StopLoss:stop_loss,
                     
                });
                vector::push_back(&mut resource.sellers,User{
                    qty:qty,
                    stock_price:x,
                    user_address:ask.user_address,
                    lvg:ask.lvg,
                    pos : true,
                    timestamp:timestamp::now_microseconds(),
                    StopLoss:ask.StopLoss,
                     
                });
                let b=simple_map::borrow_mut(&mut resource.mktdpthseller,&ask.stock_price);
                *b=*b-qty;
                sortbykey(&mut resource.mktdpthseller);
                if (ask.qty == 0) {
                    
                     vector::remove(&mut resource.asks, i); };
                qty = 0;
                break
            }
        };
        if(qty > 0) {
            let usr= User{
            lvg:lvg,
            stock_price,
            qty,
            user_address: signer::address_of(account),
            pos : true,
            timestamp:timestamp::now_microseconds(),
            StopLoss:stop_loss,
             
            };
            let aptos_coin = coin::withdraw<AptosCoin>(account, (qty*stock_price)/lvg);
            coin::deposit(@Team18, aptos_coin);
            vector::push_back(&mut resource.bids, usr);
            
            if(simple_map::contains_key(&mut resource.mktdpthbuyer,&usr.stock_price))
            {
                let b=simple_map::borrow_mut(&mut resource.mktdpthbuyer,&usr.stock_price);
                *b=*b+usr.qty;
            }
            else
            {
                simple_map::add(&mut resource.mktdpthbuyer,usr.stock_price,usr.qty);
            };

            if(simple_map::length(&mut resource.mktdpthbuyer)==0) {return};
            sortbykey(&mut resource.mktdpthbuyer);
            let len = vector::length(&resource.bids);
            mergeSorta(&mut resource.bids, 0, len-1);

        };
    }

    public entry fun sellAtlimitorder(account:&signer,lvg:u64,qty:u64,stock_price:u64,stop_loss:u64) acquires Resource
    {
        let resource = borrow_global_mut<Resource>(@Team18);

        let i = vector::length(&resource.bids);

        if (i == 0) {
            let usr= User{
            lvg,
            stock_price,
            qty,
            user_address: signer::address_of(account),
            pos : false,
            timestamp:timestamp::now_microseconds(),
            StopLoss:stop_loss,
             
            };
            let aptos_coin = coin::withdraw<AptosCoin>(account, (qty*stock_price)/lvg);
            coin::deposit(@Team18, aptos_coin);
            
            vector::push_back(&mut resource.asks, usr);
            if(simple_map::contains_key(&mut resource.mktdpthseller,&usr.stock_price))
            {
                let b=simple_map::borrow_mut(&mut resource.mktdpthseller,&usr.stock_price);
                *b=*b+usr.qty;
            }
            else
            {
                simple_map::add(&mut resource.mktdpthseller,usr.stock_price,usr.qty);
            };

            if(simple_map::length(&mut resource.mktdpthseller)==0) {return};
            sortbykey(&mut resource.mktdpthseller);
            let len = vector::length(&resource.asks);
            mergeSort(&mut resource.asks, 0, len-1);
            return
        };
        while (i > 0) { 

            i = i - 1;
            let bid = vector::borrow_mut(&mut resource.bids, i);
         

            if (bid.stock_price < stock_price) {continue};
            if (bid.qty < qty) {
                let x = bid.stock_price;
                
                qty = qty - bid.qty;
                let aptos_coin = coin::withdraw<AptosCoin>(account, (bid.qty*bid.stock_price)/lvg);
                coin::deposit(@Team18, aptos_coin);
                vector::push_back(&mut resource.buyers,User{
                    qty:bid.qty,
                    stock_price:x,
                    user_address: bid.user_address,
                    lvg,
                    pos : false,
                    timestamp:timestamp::now_microseconds(),
                    StopLoss:bid.StopLoss,
                     
                });
                
                vector::push_back(&mut resource.sellers,User{
                    qty:bid.qty,
                    stock_price:x,
                    user_address: signer::address_of(account),
                    lvg,
                    pos : false,
                    timestamp:timestamp::now_microseconds(),
                    StopLoss:stop_loss,
                     
                }); 
                let b=simple_map::borrow_mut(&mut resource.mktdpthbuyer,&bid.stock_price);
                *b=*b-bid.qty;
                sortbykey(&mut resource.mktdpthbuyer);
                vector::remove(&mut resource.bids, i);
            } 
            else {

                bid.qty = bid.qty - qty;
                let x = bid.stock_price;
                let aptos_coin = coin::withdraw<AptosCoin>(account, (qty*bid.stock_price)/lvg);
                coin::deposit(@Team18, aptos_coin);
                
                vector::push_back(&mut resource.sellers,User{
                    qty:qty,
                    stock_price:x,
                    user_address: signer::address_of(account),
                    lvg:lvg,
                    pos : false,
                    timestamp:timestamp::now_microseconds(),
                    StopLoss:stop_loss,
                });
                vector::push_back(&mut resource.buyers,User{
                    qty:qty,
                    stock_price:x,
                    user_address:bid.user_address,
                    lvg:bid.lvg,
                    pos : false,
                    timestamp:timestamp::now_microseconds(),
                    StopLoss:bid.StopLoss,
                     
                });

                let b=simple_map::borrow_mut(&mut resource.mktdpthbuyer,&bid.stock_price);
                *b=*b-qty;
                sortbykey(&mut resource.mktdpthbuyer);
                if (bid.qty == 0) { 
                    vector::remove(&mut resource.bids, i); };
                qty = 0;
                break
            };
        };
        if(qty > 0) {
            let usr= User{
            lvg:lvg,
            stock_price,
            qty,
            user_address: signer::address_of(account),
            pos : false,
            timestamp:timestamp::now_microseconds(),
            StopLoss:stop_loss,
             
            };
            let aptos_coin = coin::withdraw<AptosCoin>(account, (qty*stock_price)/lvg);
            coin::deposit(@Team18, aptos_coin);
            vector::push_back(&mut resource.asks, usr);
            if(simple_map::contains_key(&mut resource.mktdpthseller,&usr.stock_price))
            {
                let b=simple_map::borrow_mut(&mut resource.mktdpthseller,&usr.stock_price);
                *b=*b+usr.qty;
            }
            else
            {
                simple_map::add(&mut resource.mktdpthseller,usr.stock_price,usr.qty);
            };

            if(simple_map::length(&mut resource.mktdpthseller)==0){ return};
            sortbykey(&mut resource.mktdpthseller);
            let len = vector::length(&resource.asks);
            mergeSort(&mut resource.asks, 0, len-1);
        };
        

    }

    public entry fun buyAtMarketorder(account:&signer,lvg:u64,qty:u64,stop_loss:u64) acquires Resource
    {
        let resource = borrow_global_mut<Resource>(@Team18);


   

        let i = vector::length(&resource.asks);
        while (i > 0) {

            i = i - 1;
            let ask = vector::borrow_mut(&mut resource.asks, i);            
            if (ask.qty < qty) {

                qty = qty - ask.qty;
                vector::push_back(&mut resource.sellers,*ask);
                
                let aptos_coin = coin::withdraw<AptosCoin>(account, (ask.qty*ask.stock_price)/lvg);
                coin::deposit(@Team18, aptos_coin);
                vector::push_back(&mut resource.buyers,User{
                    qty:ask.qty,
                    stock_price:ask.stock_price,
                    user_address: signer::address_of(account),
                    lvg,
                    pos : true,
                    timestamp:timestamp::now_microseconds(),
                    StopLoss:stop_loss,
                     
                });
                let b=simple_map::borrow_mut(&mut resource.mktdpthseller,&ask.stock_price);
                *b=*b-ask.qty;
                sortbykey(&mut resource.mktdpthseller);
                vector::remove(&mut resource.asks, i);

            } 
            else {

                
                ask.qty = ask.qty - qty;
                let aptos_coin = coin::withdraw<AptosCoin>(account, (qty*ask.stock_price)/lvg);
                coin::deposit(@Team18, aptos_coin);
                vector::push_back(&mut resource.buyers,User{
                    qty:qty,
                    stock_price:ask.stock_price,
                    user_address: signer::address_of(account),
                    lvg,
                    pos : true,
                    timestamp:timestamp::now_microseconds(),
                    StopLoss:stop_loss,
                     
                });
                vector::push_back(&mut resource.sellers,User{
                    qty:qty,
                    stock_price:ask.stock_price,
                    user_address: ask.user_address,
                    lvg:ask.lvg,
                    pos : true,
                    timestamp:timestamp::now_microseconds(),
                    StopLoss:ask.StopLoss,
                });
                let b=simple_map::borrow_mut(&mut resource.mktdpthseller,&ask.stock_price);
                *b=*b-qty;
                sortbykey(&mut resource.mktdpthseller);
                if (ask.qty == 0) { 
                    

                    vector::remove(&mut resource.asks, i); };
                qty=0;
                break
            };
        };
        if(qty>0)
        {
            return 
        };

    }

    public entry fun sellAtMarketorder(account:&signer,lvg:u64,qty:u64,stop_loss:u64) acquires Resource
    {
        let resource = borrow_global_mut<Resource>(@Team18);
        let i = vector::length(&resource.bids);
        while (i > 0) {

            i = i - 1;
            let bid = vector::borrow_mut(&mut resource.bids, i);            
            if (bid.qty < qty) {

                qty = qty - bid.qty;
                vector::push_back(&mut resource.buyers,*bid);
                let aptos_coin = coin::withdraw<AptosCoin>(account, (bid.qty*bid.stock_price)/lvg);
                coin::deposit(@Team18, aptos_coin);
                vector::push_back(&mut resource.sellers,User{
                    qty:bid.qty,
                    stock_price:bid.stock_price,
                    user_address: signer::address_of(account),
                    lvg,
                    pos : false,
                    timestamp:timestamp::now_microseconds(),
                    StopLoss:stop_loss,

                     
                });
                let b=simple_map::borrow_mut(&mut resource.mktdpthbuyer,&bid.stock_price);
                *b=*b-bid.qty;
                sortbykey(&mut resource.mktdpthbuyer);
                vector::remove(&mut resource.bids, i);

            } 
            else {

                bid.qty = bid.qty - qty;
                let aptos_coin = coin::withdraw<AptosCoin>(account, (qty*bid.stock_price)/lvg);
                coin::deposit(@Team18, aptos_coin);
                vector::push_back(&mut resource.sellers,User{
                    qty:qty,
                    stock_price:bid.stock_price,
                    user_address: signer::address_of(account),
                    lvg,
                    pos : false,
                    timestamp:timestamp::now_microseconds(),
                    StopLoss:stop_loss,
                     
                });
                vector::push_back(&mut resource.buyers,User{
                    qty:qty,
                    stock_price:bid.stock_price,
                    user_address: bid.user_address,
                    lvg:bid.lvg,
                    pos : false,
                    timestamp:timestamp::now_microseconds(),
                    StopLoss:bid.StopLoss,
                     
                });
                let b=simple_map::borrow_mut(&mut resource.mktdpthbuyer,&bid.stock_price);
                *b=*b-qty;
                sortbykey(&mut resource.mktdpthbuyer);
                if (bid.qty == 0) { 
                    vector::remove(&mut resource.bids, i); };
                qty=0;
                break
            };
        };
        if(qty>0)
        {
            return 
        };

    }





    fun Expire(price:u64) acquires Resource,SignerCapability
    {
        let resource = borrow_global_mut<Resource>(@Team18);
        if(timestamp::now_microseconds() < 86400000000+resource.start_time){ 

            return
        };
        
        resource.start_time=resource.start_time+ 86400000000;

        
        let resource_signer = account::create_signer_with_capability(&borrow_global_mut<SignerCapability>(@Team18).resource_signer_cap);
        
        let i1 = vector::length(&resource.bids);
        while(i1 > 0){
            i1 = i1 - 1;
            let bid = vector::borrow_mut(&mut resource.bids, i1);
            if(simple_map::contains_key(&mut resource.mktdpthbuyer,&bid.stock_price))
            {
                simple_map::remove(&mut resource.mktdpthbuyer, &bid.stock_price);
            };

            
            coin::deposit(bid.user_address, coin::withdraw<AptosCoin>(&resource_signer, ((bid.qty*bid.stock_price)/bid.lvg)));
            vector::pop_back(&mut resource.bids);
            


        };
        let i2=vector::length(&resource.buyers);

        while(i2>0)
        {
            i2=i2-1;   
            let buy=vector::borrow_mut(&mut resource.buyers,i2);
            let g=((buy.qty*buy.stock_price)/buy.lvg);
            if( g+buy.qty*price > buy.qty*buy.stock_price)
            {coin::deposit(buy.user_address, coin::withdraw<AptosCoin>(&resource_signer, g+buy.qty*price-buy.qty*buy.stock_price));};

            vector::pop_back(&mut resource.buyers);
            
        };
        let i3 = vector::length(&resource.asks);
        while(i3 > 0){
            i3 = i3 - 1;
            let ask = vector::borrow_mut(&mut resource.asks, i3);
            if(simple_map::contains_key(&mut resource.mktdpthbuyer,&ask.stock_price))
            {
                simple_map::remove(&mut resource.mktdpthseller, &ask.stock_price);
                sortbykey(&mut resource.mktdpthseller);
            };
            
            coin::deposit(ask.user_address, coin::withdraw<AptosCoin>(&resource_signer, ((ask.qty*ask.stock_price)/ask.lvg)));
            vector::pop_back(&mut resource.asks);

        };
        let i4=vector::length(&resource.sellers);

        while(i4>0)
        {
            i4=i4-1;   
            let sell=vector::borrow_mut(&mut resource.sellers,i4);
            let g=((sell.qty*sell.stock_price)/sell.lvg);

            if( g+sell.qty*sell.stock_price>sell.qty*price)
            {coin::deposit(sell.user_address, coin::withdraw<AptosCoin>(&resource_signer, g + sell.qty*sell.stock_price - sell.qty*price));};
            vector::pop_back(&mut resource.sellers);
            
        };
    }


    fun get_price_in_bid(indx:u64,resource:&mut Resource):u64 {


        let ret:u64=0;

        let i = vector::length(&resource.bids);
        let buy = vector::borrow_mut(&mut resource.buyers, indx);
        let qty=buy.qty;
        while (i > 0) {

            i = i - 1;
            let bid = vector::borrow_mut(&mut resource.bids, i);            
            if (bid.qty < qty) {

                qty = qty - bid.qty;
                vector::push_back(&mut resource.buyers,*bid);
                ret=ret+ (bid.qty*bid.stock_price);
                let b=simple_map::borrow_mut(&mut resource.mktdpthbuyer,&bid.stock_price);
                *b=*b-bid.qty;
                sortbykey(&mut resource.mktdpthbuyer);
                vector::remove(&mut resource.bids, i);

            } 
            else {
                
                bid.qty = bid.qty - qty;
                vector::push_back(&mut resource.buyers,User{
                    qty:qty,
                    stock_price:bid.stock_price,
                    user_address: bid.user_address,
                    lvg:bid.lvg,
                    pos: false,
                    timestamp:timestamp::now_microseconds(),
                    StopLoss:bid.StopLoss,
                });
                ret= ret +qty*bid.stock_price;
                let b=simple_map::borrow_mut(&mut resource.mktdpthbuyer,&bid.stock_price);
                *b=*b-qty;
                sortbykey(&mut resource.mktdpthbuyer);
                if (bid.qty == 0) { vector::remove(&mut resource.bids, i); };
                qty=0;
                break
            };
        };
        if(qty>0)
        {   let ab:u64 = 0;
            ab
        }
        else
        ret

    }
    fun get_price_in_ask(indx:u64,resource:&mut Resource):u64 {


        let ret:u64=0;

        let i = vector::length(&resource.asks);
        let sell = vector::borrow_mut(&mut resource.sellers, indx);
        let qty=sell.qty;

        while (i > 0) {

            i = i - 1;
            let ask = vector::borrow_mut(&mut resource.asks, i);            
            if (ask.qty < qty) {

                qty = qty - ask.qty;
                vector::push_back(&mut resource.sellers,*ask);
                ret=ret+ (ask.qty*ask.stock_price);
                let b=simple_map::borrow_mut(&mut resource.mktdpthseller,&ask.stock_price);
                *b=*b-ask.qty;
                sortbykey(&mut resource.mktdpthseller);
                vector::remove(&mut resource.asks, i);

            } 
            else {
                
                ask.qty = ask.qty - qty;
                vector::push_back(&mut resource.sellers,User{
                    qty:qty,
                    stock_price:ask.stock_price,
                    user_address: ask.user_address,
                    lvg:ask.lvg,
                    pos: true,
                    timestamp:timestamp::now_microseconds(),
                    StopLoss:ask.StopLoss,
                });
                ret=ret+qty*ask.stock_price;
                let b=simple_map::borrow_mut(&mut resource.mktdpthseller,&ask.stock_price);
                *b=*b-qty;
                sortbykey(&mut resource.mktdpthseller);
                if (ask.qty == 0) { vector::remove(&mut resource.asks, i); };
                qty=0;
                break
            };
        };
        if(qty>0)
        {
            let ab:u64 = 0;
            ab
        }
        else
        ret

    }

    public entry fun Exit_all(account:&signer) acquires Resource,SignerCapability
    {
        let usr_addr=signer::address_of(account);
        let resource = borrow_global_mut<Resource>(@Team18);
        let resource_signer = account::create_signer_with_capability(&borrow_global_mut<SignerCapability>(@Team18).resource_signer_cap);
                let i3 = vector::length(&resource.asks);
        while(i3 > 0){
            i3 = i3 - 1;
            let ask = vector::borrow_mut(&mut resource.asks, i3);
            if(ask.user_address==usr_addr)
            {
                if(simple_map::contains_key(&mut resource.mktdpthseller,&ask.stock_price))
                {
                    let b=simple_map::borrow_mut(&mut resource.mktdpthseller,&ask.stock_price);
                    *b=*b-ask.qty;
                    sortbykey(&mut resource.mktdpthseller);
                };
                
                coin::deposit(ask.user_address, coin::withdraw<AptosCoin>(&resource_signer, ((ask.qty*ask.stock_price)/ask.lvg)));
                vector::remove(&mut resource.asks,i3);
            };
            

        };
        let i4 = vector::length(&resource.bids);
        
        while(i4 > 0){
            i4 = i4 - 1;
            let bid= vector::borrow_mut(&mut resource.bids, i4);
            if(bid.user_address==usr_addr)
            {
                if(simple_map::contains_key(&mut resource.mktdpthseller,&bid.stock_price))
                {
                    let b=simple_map::borrow_mut(&mut resource.mktdpthseller,&bid.stock_price);
                    *b=*b-bid.qty;
                    sortbykey(&mut resource.mktdpthseller);
                };
                
                coin::deposit(bid.user_address, coin::withdraw<AptosCoin>(&resource_signer, ((bid.qty*bid.stock_price)/bid.lvg)));
                vector::remove(&mut resource.bids,i4);
            };
            

        };
        
        let i = vector::length(&resource.buyers);
        while(i>0)
        {
            i=i-1;
            let buy = vector::borrow_mut(&mut resource.buyers, i);
            if(buy.user_address==usr_addr)
            {

                let cost_price=get_price_in_bid(i,resource);
                if(cost_price==0){ continue};
                let buy2 = vector::borrow_mut(&mut resource.buyers, i);
                if(((buy2.qty*buy2.stock_price)/buy2.lvg)+cost_price > buy2.stock_price*buy2.qty)
                {
                    let a=((buy2.qty*buy2.stock_price)/buy2.lvg)+cost_price-buy2.stock_price*buy2.qty;
                coin::deposit(buy2.user_address, coin::withdraw<AptosCoin>(&resource_signer, a));
                };
                vector::remove(&mut resource.buyers, i);
            };

        };
        let j = vector::length(&resource.sellers);
        while(j>0)
        {
            j=j-1;
            let sell = vector::borrow_mut(&mut resource.sellers, j);
            if(sell.user_address==usr_addr)
            {
                let cost_price=get_price_in_ask(j,resource);
                if(cost_price==0){ continue};

                let sell2=vector::borrow_mut(&mut resource.sellers, j);
                if(((sell2.qty*sell2.stock_price)/sell2.lvg)+sell2.stock_price*sell2.qty > cost_price)
                {
                let a=((sell2.qty*sell2.stock_price)/sell2.lvg)+sell2.stock_price*sell2.qty-cost_price;
                coin::deposit(sell2.user_address, coin::withdraw<AptosCoin>(&resource_signer, a));
                };
                vector::remove(&mut resource.sellers, j);
            };

        };



        
        
    }


    fun auto_liquidation(price:u64) acquires Resource,SignerCapability
    {
      
        let resource = borrow_global_mut<Resource>(@Team18);
        let mp : SimpleMap<address,u64> = simple_map::create();
        let resource_signer = account::create_signer_with_capability(&borrow_global_mut<SignerCapability>(@Team18).resource_signer_cap);
        let i = vector::length(&resource.buyers);
        while(i>0)
        {
            i=i-1;
            let buy = vector::borrow_mut(&mut resource.buyers, i);
            let margin=(buy.qty*buy.stock_price)/buy.lvg;
            if(buy.qty*price+margin <= buy.qty*buy.stock_price)
            {
                let cost_price=get_price_in_bid(i,resource);
                if(cost_price==0){ continue};

                vector::remove(&mut resource.buyers, i);
                continue
            };



            if(price <= buy.StopLoss)
            {
                let cost_price=get_price_in_bid(i,resource);
                if(cost_price==0) {continue};
                let buy = vector::borrow_mut(&mut resource.buyers, i);
                coin::deposit(buy.user_address, coin::withdraw<AptosCoin>(&resource_signer, (buy.qty*buy.stock_price)/buy.lvg + cost_price-buy.qty*buy.stock_price));

                vector::remove(&mut resource.buyers, i);
                continue
            };
            


            if(buy.qty*price + (3*margin)/4 <= (buy.qty*buy.stock_price) && buy.lvg!=1 )
            {
                let req_margin=(buy.stock_price*buy.qty)/(buy.lvg-1);
                if(!simple_map::contains_key(&mut mp,&buy.user_address))
                { simple_map::add(&mut mp,buy.user_address,req_margin-margin)}
                else
                {
                    let b=simple_map::borrow_mut(&mut mp,&buy.user_address);
                    *b=*b+req_margin-margin;
                }
                

            }


        };


        let j = vector::length(&resource.sellers);
        while(j>0)
        {
            j=j-1;
            let sell = vector::borrow_mut(&mut resource.sellers, j);
            let margin=(sell.qty*sell.stock_price)/sell.lvg;
            if(margin+sell.qty*sell.stock_price <= sell.qty*price)
            {
                let cost_price=get_price_in_ask(j,resource);
                if(cost_price==0){ continue};
                vector::remove(&mut resource.sellers, j);
                continue
            };


            if(price <= sell.StopLoss)
            {
                let cost_price=get_price_in_ask(j,resource);
                if(cost_price==0){ continue};
                let sell = vector::borrow_mut(&mut resource.sellers, j);
                coin::deposit(sell.user_address, coin::withdraw<AptosCoin>(&resource_signer, (sell.qty*sell.stock_price)/sell.lvg +sell.qty*sell.stock_price - cost_price));
                vector::remove(&mut resource.sellers, j);
                continue
            };
            
            if((3*margin)/4+sell.qty*sell.stock_price <= sell.qty*price && sell.lvg != 1)
            {
                let req_margin=(sell.stock_price*sell.qty)/(sell.lvg-1);
                if(!simple_map::contains_key(&mut mp,&sell.user_address))
                { simple_map::add(&mut mp,sell.user_address,req_margin-margin)}
                else
                {
                    let b=simple_map::borrow_mut(&mut mp,&sell.user_address);
                    *b=*b+req_margin-margin;
                };
                
             
            }            


        };

        let v: &mut vector<address> = &mut simple_map::keys(&mut mp);
        let i = vector::length(v);
        while(i>0)
        {
            i=i-1;
            let usr_addr=vector::borrow_mut(v,i);
            let amt=simple_map::borrow_mut(&mut mp,usr_addr);
            event::emit_event<Margin_call>(
                &mut resource.margin_call_event,
                Margin_call { 
                    margin_needed:*amt,
                    timestamp: timestamp::now_microseconds(),
                    user_address:*usr_addr,

                }
              );
        }


    }


    public entry fun deposit_margin(account:&signer,amount:u64) acquires Resource,DexOrderBook
    {

        let resource= borrow_global_mut<Resource>(@Team18);

        let sum=0;
        let usr_addr=signer::address_of(account);
        let price = borrow_global_mut<DexOrderBook>(@Team18).ltp;
        let i = vector::length(&mut resource.buyers);
        while(i>0)
        {
            i=i-1;
            let buy = vector::borrow_mut(&mut resource.buyers, i);
            if(buy.user_address != usr_addr){ continue};
            let margin=(buy.qty*buy.stock_price)/buy.lvg;
            if((buy.qty*price+(3*margin)/4 <= buy.qty*buy.stock_price) && (buy.lvg != 1))
            {
                
                let req_lvg=buy.lvg-1;
                let margin_req=(buy.stock_price*buy.qty)/req_lvg;
                if(sum+margin_req > amount+margin)
                {
                    break
                }
                else{
                    buy.lvg=buy.lvg-1;
                    sum=sum+margin_req-margin;
                }
                
            };
            


        };
        let i = vector::length(&mut resource.sellers);
        while(i>0)
        {
            i=i-1;
            let sell = vector::borrow_mut(&mut resource.sellers, i);
            if(sell.user_address != usr_addr){ continue};
            let margin=(sell.qty*sell.stock_price)/sell.lvg;
            if((sell.qty*sell.stock_price+(3*margin)/4 <= sell.qty*price) && (sell.lvg != 1))
            {
                
                let req_lvg=sell.lvg-1;
                let margin_req=(sell.stock_price*sell.qty)/req_lvg;
                if(sum+margin_req > amount +margin)
                {
                    break
                }
                else{
                    sell.lvg=sell.lvg-1;
                    sum=sum+margin_req-margin;
                }
                
            };
            


        };
        let aptos_coin = coin::withdraw<AptosCoin>(account, sum);
        coin::deposit(@Team18, aptos_coin);

    }

    public entry fun exitOrder (account:&signer,timestamp:u64,lvg:u64,bids:bool,qty:u64,stock_price:u64) acquires Resource , SignerCapability
    {
        let resource = borrow_global_mut<Resource>(@Team18);
        let resource_signer = account::create_signer_with_capability(&borrow_global_mut<SignerCapability>(@Team18).resource_signer_cap);
        let usr_addr=signer::address_of(account);

        if(bids)
        {
            let i1 = vector::length(&resource.bids);
            while(i1 > 0){
                
                i1 = i1 - 1;
                let bid = vector::borrow_mut(&mut resource.bids, i1);
                if(bid.timestamp==timestamp && bid.qty==qty && bid.lvg==lvg && bid.user_address==usr_addr && bid.stock_price==stock_price)
                {

                        if(simple_map::contains_key(&mut resource.mktdpthbuyer,&bid.stock_price))
                    {
                        let b=simple_map::borrow_mut(&mut resource.mktdpthbuyer,&bid.stock_price);
                        *b=*b-qty;
                      
                    };

                    
                    coin::deposit(bid.user_address, coin::withdraw<AptosCoin>(&resource_signer, ((bid.qty*bid.stock_price)/bid.lvg)));
                    vector::remove(&mut resource.bids,i1);
                    return


                };
                
                

            };

        }
        else{

            let i1 = vector::length(&resource.asks);
            while(i1 > 0){
                
                i1 = i1 - 1;
                let ask = vector::borrow_mut(&mut resource.asks, i1);
                if(ask.timestamp==timestamp && ask.qty==qty && ask.lvg==lvg && ask.user_address==usr_addr && ask.stock_price==stock_price)
                {

                        if(simple_map::contains_key(&mut resource.mktdpthseller,&ask.stock_price))
                    {
                        let b=simple_map::borrow_mut(&mut resource.mktdpthseller,&ask.stock_price);
                        *b=*b-qty;
                      
                    };

                    
                    coin::deposit(ask.user_address, coin::withdraw<AptosCoin>(&resource_signer, ((ask.qty*ask.stock_price)/ask.lvg)));
                    vector::remove(&mut resource.asks,i1);
                    return


                };
                
                

            };



        }


        
        

    
    }
    public entry fun exitPosition (account:&signer,timestamp:u64,lvg:u64,buys:bool,qty:u64,stock_price:u64) acquires Resource,SignerCapability
    {
        let usr_addr=signer::address_of(account);
        let resource = borrow_global_mut<Resource>(@Team18);
        let resource_signer = account::create_signer_with_capability(&borrow_global_mut<SignerCapability>(@Team18).resource_signer_cap);
        if(buys)
        {
            let i = vector::length(&resource.buyers);
            while(i>0)
            {
                i=i-1;
                let buy = vector::borrow_mut(&mut resource.buyers, i);
                if(buy.user_address==usr_addr && buy.timestamp==timestamp && buy.lvg==lvg && buy.stock_price==stock_price)
                {

                    let cost_price=get_price_in_bid(i,resource);
                    if(cost_price==0){ continue};
                    let buy2 = vector::borrow_mut(&mut resource.buyers, i);
                    if(((buy2.qty*buy2.stock_price)/buy2.lvg)+cost_price > buy2.stock_price*buy2.qty)
                    {
                        let a=((buy2.qty*buy2.stock_price)/buy2.lvg)+cost_price-buy2.stock_price*buy2.qty;
                        coin::deposit(buy2.user_address, coin::withdraw<AptosCoin>(&resource_signer, a));
                    };
                    vector::remove(&mut resource.buyers, i);
                    return
                };

            };
        }
        else
        {
            let j = vector::length(&resource.sellers);
            while(j>0)
            {
                j=j-1;
                let sell = vector::borrow_mut(&mut resource.sellers, j);
                if(sell.user_address==usr_addr && sell.timestamp==timestamp && sell.lvg==lvg && sell.stock_price==stock_price)
                {
                    let cost_price=get_price_in_ask(j,resource);
                    if(cost_price==0) {continue};
                    let sell2=vector::borrow_mut(&mut resource.sellers, j);
                    if(((sell2.qty*sell2.stock_price)/sell2.lvg)+sell2.stock_price*sell2.qty > cost_price)
                    {
                        let a=((sell2.qty*sell2.stock_price)/sell2.lvg)+sell2.stock_price*sell2.qty-cost_price;
                        coin::deposit(sell2.user_address, coin::withdraw<AptosCoin>(&resource_signer, a));
                    };
                    vector::remove(&mut resource.sellers, j);

                    return
                };

            };

        }





        
        

    
    }


    fun sortAscending(orders: &mut vector<Order>) {

        let i = vector::length(orders);
        while (i > 0) {
            let j = 0;
            while (j < i - 1) {
                let k = j + 1;
                let ask1 = vector::borrow(orders, j);
                let ask2 = vector::borrow(orders, k);
                if (ask1.price > ask2.price) {
                    vector::swap(orders, j, k);
                };
                j = j + 1;
            };
            i = i - 1;
        }
    }
    fun sortDescending(orders: &mut vector<Order>) {

        let i = vector::length(orders);
        while (i > 0) {
            let j = 0;
            while (j < i - 1) {
                let k = j + 1;
                let bid1 = vector::borrow(orders, j);
                let bid2 = vector::borrow(orders, k);
                if (bid1.price < bid2.price) {
                    vector::swap(orders, j, k);
                };
                j = j + 1;
            };
            i = i - 1;
        }
    }

    public entry fun placeBidForCoin(account: &signer, price: u64, qty: u64) acquires DexOrderBook , SignerCapability,Resource{
        coin::register<Xcoin>(account);
        let tradeTookPlace = false;

        let orderBook: &mut DexOrderBook = borrow_global_mut<DexOrderBook>(@Team18);

        let i = vector::length(&orderBook.asks);
        if (i == 0) {
            let aptos_coin = coin::withdraw<AptosCoin>(account, qty * price);
            coin::deposit(@Team18, aptos_coin);
            let order = Order {
                price,
                qty,
                user_address: signer::address_of(account),
            };
            vector::push_back(&mut orderBook.bids, order);
            sortDescending(&mut orderBook.bids);
            return
        };
        while (i > 0) {

            i = i - 1;
            let ask = vector::borrow_mut(&mut orderBook.asks, i);
            let ask_price = ask.price;
            if (ask_price > price){ continue};
            if (ask.qty < qty) {
                let withdraw_amt = ask.qty * ask_price;
                let aptos_coin = coin::withdraw<AptosCoin>(account, withdraw_amt);
                coin::deposit(ask.user_address, aptos_coin);
                let resource_signer = account::create_signer_with_capability(&borrow_global_mut<SignerCapability>(@Team18).resource_signer_cap);
                let xCoin = coin::withdraw<Xcoin>(&resource_signer, ask.qty);
                coin::deposit(signer::address_of(account), xCoin);
                qty = qty - ask.qty;
                vector::remove(&mut orderBook.asks, i);
                orderBook.ltp = ask_price;
                tradeTookPlace = true;
            } else {
                let withdraw_amt = qty * ask_price;
                let aptos_coin = coin::withdraw<AptosCoin>(account, withdraw_amt);
                coin::deposit(ask.user_address, aptos_coin);
                let resource_signer = account::create_signer_with_capability(&borrow_global_mut<SignerCapability>(@Team18).resource_signer_cap);
                let xCoin = coin::withdraw<Xcoin>(&resource_signer, qty);
                coin::deposit(signer::address_of(account), xCoin);
                ask.qty = ask.qty - qty;
                if (ask.qty == 0) { vector::remove(&mut orderBook.asks, i); };
                orderBook.ltp = ask_price;
                qty = 0;
                tradeTookPlace = true;
            }
        };
        if(qty > 0) {
            let aptos_coin = coin::withdraw<AptosCoin>(account, qty * price);
            coin::deposit(@Team18, aptos_coin);
            let order = Order {
                price,
                qty,
                user_address: signer::address_of(account),
            };
            vector::push_back(&mut orderBook.bids, order);

            sortDescending(&mut orderBook.bids);
        };
        if (tradeTookPlace) {

            event::emit_event<LTPEvent>(
                &mut orderBook.set_ltp_event,
                LTPEvent { 
                    ltp: orderBook.ltp,
                    timestamp: timestamp::now_microseconds(),
                }
            );
            let b=giving_futures_price(orderBook.ltp);
            Expire(b);
            auto_liquidation(b);
            
        };

    }



    public entry fun placeAskForCoin(account: &signer, price: u64, qty: u64) acquires DexOrderBook ,SignerCapability,Resource{
        coin::register<Xcoin>(account);
        let tradeTookPlace = false;
        let orderBook = borrow_global_mut<DexOrderBook>(@Team18);

        let i = vector::length(&orderBook.bids);
        if (i == 0) {
            let x_coin = coin::withdraw<Xcoin>(account, qty);
            coin::deposit(@Team18, x_coin);
            let order = Order {
                price,
                qty,
                user_address: signer::address_of(account),
            };
            vector::push_back(&mut orderBook.asks, order);
            sortAscending(&mut orderBook.asks);
            return
        };
        while (i > 0) {
            i = i - 1;
            let bid = vector::borrow_mut(&mut orderBook.bids, i);
            if (bid.price < price){ continue};
            if (bid.qty < qty) {
                let withdraw_amt = bid.qty * bid.price;
                let xCoin = coin::withdraw<Xcoin>(account, bid.qty);
                coin::deposit(bid.user_address, xCoin);
                let resource_signer = account::create_signer_with_capability(&borrow_global_mut<SignerCapability>(@Team18).resource_signer_cap);
                let aptos_coin = coin::withdraw<AptosCoin>(&resource_signer, withdraw_amt);
                coin::deposit(signer::address_of(account), aptos_coin);
                qty = qty - bid.qty;
                orderBook.ltp = bid.price;
                tradeTookPlace = true;
                vector::remove(&mut orderBook.bids, i);
            } else {
                let withdraw_amt = qty * bid.price;
                let xCoin = coin::withdraw<Xcoin>(account, qty);
                coin::deposit(bid.user_address, xCoin);
                let resource_signer = account::create_signer_with_capability(&borrow_global_mut<SignerCapability>(@Team18).resource_signer_cap);
                let aptos_coin = coin::withdraw<AptosCoin>(&resource_signer, withdraw_amt);
                coin::deposit(signer::address_of(account), aptos_coin);
                bid.qty = bid.qty - qty;
                orderBook.ltp = bid.price;
                tradeTookPlace = true;
                qty = 0;
                if (bid.qty == 0) { vector::remove(&mut orderBook.bids, i); };
            }
        };
        if(qty > 0) {
            let x_coin = coin::withdraw<Xcoin>(account, qty);
            coin::deposit(@Team18, x_coin);
            let order = Order {
                price,
                qty,
                user_address: signer::address_of(account),
            };
            vector::push_back(&mut orderBook.asks, order);

            sortAscending(&mut orderBook.asks);
        };
        if (tradeTookPlace) {
            event::emit_event<LTPEvent>(
                &mut orderBook.set_ltp_event,
                LTPEvent { 
                    ltp: orderBook.ltp,
                    timestamp: timestamp::now_microseconds(),
                }
            );
            let b=giving_futures_price(orderBook.ltp);
            Expire(b);
            auto_liquidation(b);
            
        }
    }



    public fun merge(v: &mut vector<User>, left: u64, mid: u64, right: u64) {
        let subArrayOne = mid + 1 - left;
        let subArrayTwo = right - mid;

        let lv = vector::empty<User>();
        let rv = vector::empty<User>();

        let i=0;

        while(i < subArrayOne) {
            vector::push_back(&mut lv, *vector::borrow(v, left + i));
            i = i + 1;
        };

        i=0;

        while(i < subArrayTwo) {
            vector::push_back(&mut rv, *vector::borrow(v, mid + 1 + i));
            i = i + 1;
        };

        let indexOfSubArrayOne = 0;
        let indexOfSubArrayTwo = 0;
        let indexOfMergedArray = left;

        while (indexOfSubArrayOne < subArrayOne && indexOfSubArrayTwo < subArrayTwo) {
                let a = vector::borrow(&lv, indexOfSubArrayOne);
                let compa = a.stock_price;

                let b = vector::borrow(&rv, indexOfSubArrayTwo);
                let compb = b.stock_price;

                let cur = vector::borrow_mut(v, indexOfMergedArray);

                if(compa >= compb) {
                    *cur = *a;
                    indexOfSubArrayOne = indexOfSubArrayOne + 1;
                } else {
                    *cur = *b;
                    indexOfSubArrayTwo = indexOfSubArrayTwo + 1;
                };

                indexOfMergedArray = indexOfMergedArray + 1;
        };

        while (indexOfSubArrayOne < subArrayOne) {
            let cur = vector::borrow_mut(v, indexOfMergedArray);
            let a = vector::borrow(&lv, indexOfSubArrayOne);

            *cur = *a;

            indexOfSubArrayOne = indexOfSubArrayOne + 1;
            indexOfMergedArray = indexOfMergedArray + 1;
        };

        while (indexOfSubArrayTwo < subArrayTwo) {
            let cur = vector::borrow_mut(v, indexOfMergedArray);
            let b = vector::borrow_mut(&mut rv, indexOfSubArrayTwo);
            
            *cur = *b;

            indexOfSubArrayTwo = indexOfSubArrayTwo + 1;
            indexOfMergedArray = indexOfMergedArray + 1;
        };
    }

    public fun mergeSort(v: &mut vector<User>, begin: u64, end: u64) {
        if (begin >= end){ return};
        let mid = begin + (end - begin) / 2;
        mergeSort(v, begin, mid);
        mergeSort(v, mid + 1, end);
        merge(v, begin, mid, end);
    }

    public fun mergea(v: &mut vector<User>, left: u64, mid: u64, right: u64) {
        let subArrayOne = mid + 1 - left;
        let subArrayTwo = right - mid;

        let lv = vector::empty<User>();
        let rv = vector::empty<User>();

        let i=0;

        while(i < subArrayOne) {
            vector::push_back(&mut lv, *vector::borrow(v, left + i));
            i = i + 1;
        };

        i=0;

        while(i < subArrayTwo) {
            vector::push_back(&mut rv, *vector::borrow(v, mid + 1 + i));
            i = i + 1;
        };

        let indexOfSubArrayOne = 0;
        let indexOfSubArrayTwo = 0;
        let indexOfMergedArray = left;

        while (indexOfSubArrayOne < subArrayOne && indexOfSubArrayTwo < subArrayTwo) {
                let a = vector::borrow(&lv, indexOfSubArrayOne);
                let compa = a.stock_price;

                let b = vector::borrow(&rv, indexOfSubArrayTwo);
                let compb = b.stock_price;

                let cur = vector::borrow_mut(v, indexOfMergedArray);

                if(compa <= compb) {
                    *cur = *a;
                    indexOfSubArrayOne = indexOfSubArrayOne + 1;
                } else {
                    *cur = *b;
                    indexOfSubArrayTwo = indexOfSubArrayTwo + 1;
                };

                indexOfMergedArray = indexOfMergedArray + 1;
        };

        while (indexOfSubArrayOne < subArrayOne) {
            let cur = vector::borrow_mut(v, indexOfMergedArray);
            let a = vector::borrow(&lv, indexOfSubArrayOne);

            *cur = *a;

            indexOfSubArrayOne = indexOfSubArrayOne + 1;
            indexOfMergedArray = indexOfMergedArray + 1;
        };

        while (indexOfSubArrayTwo < subArrayTwo) {
            let cur = vector::borrow_mut(v, indexOfMergedArray);
            let b = vector::borrow_mut(&mut rv, indexOfSubArrayTwo);
            
            *cur = *b;

            indexOfSubArrayTwo = indexOfSubArrayTwo + 1;
            indexOfMergedArray = indexOfMergedArray + 1;
        };
    }

    public fun mergeSorta(v: &mut vector<User>, begin: u64, end: u64) {
        if (begin >= end) {return};
        let mid = begin + (end - begin) / 2;
        mergeSorta(v, begin, mid);
        mergeSorta(v, mid + 1, end);
        mergea(v, begin, mid, end);
    }


}