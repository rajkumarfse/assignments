$(function() {
    $('.hamburger').on('click', function(){
        $('nav').toggle('fast');
    });
    window.show = function(id) {
        $(id).show();
    }
    window.hide = function(id) {
        $(id).hide();
    }

    window.showLoader = function() {
        $("#loading").show();
    }

    window.hideLoader = function() {
        $("#loading").hide();
    }

    $('.item-view .item-qty .btn-plus').on('click', function(e) {
        let val = parseInt($(this).prev().val());
        $(this).prev().val(++val);
    });
    $('.item-view .item-qty .btn-minus').on('click', function(e) {
        let val = parseInt($(this).next().val());
        if(val > 1) $(this).next().val(--val);
    });
    $('.btn-add-to-cart, .btn-order-now').on('click', function(e) {
        let params = {
            id: $(this).data('itemId'),
            qty: $('.item-qty [name=qty]').val()
        }
        let is_order_now = $(this).hasClass('btn-order-now') ? true : false;
        showLoader();
        $.ajax({
            method: "POST",
            url: "/cart/add-to-cart",
            data: params
        })
        .done(function( msg ) {
            console.log( msg );
            if(is_order_now) {
                window.location = '/cart';
            }
            hideLoader();
            $.toast({
                text: 'Item added to your cart!',
                loader: false,
            });
        });
    });

    $('#login_form').on('submit', function(e) {
        e.preventDefault();
        let params = {
            username: $('#username').val(),
            password: $('#password').val()
        }
        showLoader();
        $.ajax({
            method: "POST",
            url: "/login",
            data: params
        })
        .done(function( response ) {
            hideLoader();
            if(response.status) {
                window.location = '/items';
            } else {
                alert('Invalid credentials');
            }
        });
    });

    $('.cart').on('click', '.btn-plus', function(e) {
        let val = parseInt($(this).prev().val());
        $(this).prev().val(++val);
        let params = {
            id: $(this).data('itemId'),
            qty: val
        }
        showLoader();
        $.ajax({
            method: "POST",
            url: "/cart/update-cart",
            data: params
        })
        .done(function( msg ) {
            hideLoader();
            const $cart = $(msg);
            if($cart.find('.cart').length) {
                $('.cart').html($cart.find('.cart').html());
            }
        });
    });
    $('.cart').on('click', '.btn-minus', function(e) {
        let val = parseInt($(this).next().val());
        if(val > 1) {
            $(this).next().val(--val);
            let params = {
                id: $(this).data('itemId'),
                qty: val
            }
            showLoader();
            $.ajax({
                method: "POST",
                url: "/cart/update-cart",
                data: params
            })
            .done(function( msg ) {
                hideLoader();
                const $cart = $(msg);
                if($cart.find('.cart').length) {
                    $('.cart').html($cart.find('.cart').html());
                }
            });
        }
    });

    $('.cart').on('click', '.remove-item', function(e) {
        e.preventDefault();
        let params = {
            id: $(this).data('itemId')
        }
        showLoader();
        $.ajax({
            method: "POST",
            url: "/cart/remove-item",
            data: params
        })
        .done(function( msg ) {
            hideLoader();
            const $cart = $(msg);
            if($cart.find('.cart').length) {
                $('.cart').html($cart.find('.cart').html());
            }
        });
    });

    $('.cart').on('click', '#place-order', function(e) {
        showLoader();
        $.ajax({
            method: "POST",
            url: "/order/place-order"
        })
        .done(function( msg ) {
            hideLoader();
            const $cart = $(msg);
            if($cart.find('.cart').length) {
                $('.cart').html($cart.find('.cart').html());
                window.location = '/orders';
            }
        });
    });

    let cancelOrder = (order_id) => {        
        let $popup = $('#popup1');
        $popup.on('click', '.js-btn_confirm', function(e) {
            let params = {
                id: order_id
            }
            showLoader();
            $.ajax({
                method: "POST",
                url: "/orders/cancel-order",
                data: params
            })
            .done(function( msg ) {
                hideLoader();
                const $orders = $(msg);
                if($orders.find('.orders').length) {
                    $('.orders').html($orders.find('.orders').html());
                }
                $popup.hide();
                if($('.order').length) {
                    window.location = '/orders';
                }
            });
        });  
        $popup.show(); 
    }
    
    $('.orders').on('click', '.js-btn_cancel', function(e) {
        let order_id = $(this).data('orderId');
        cancelOrder(order_id);
    });
    $('.order').on('click', '.js-btn_cancel', function(e) {
        let order_id = $(this).data('orderId');
        cancelOrder(order_id);
    });

    $('.order').on('click', '.item-qty .btn-plus', function(e) {
        let val = parseInt($(this).prev().val());
        $(this).prev().val(++val);
    });

    $('.order').on('click', '.item-qty .btn-minus', function(e) {
        let val = parseInt($(this).next().val());
        if(val > 1) $(this).next().val(--val);
    });

    $('.order').on('click', '.remove-item', function(e) {
        e.preventDefault();
        let order_id = $(this).data('orderId');
        let params = {
            id: $(this).data('itemId')
        }
        showLoader();
        $.ajax({
            method: "POST",
            url: `/orders/remove-item/${order_id}`,
            data: params
        })
        .done(function( msg ) {
            hideLoader();
            if(typeof msg.status !== 'undefined' && msg.status && msg.isCancelled) {
                window.location = '/orders';
            } else {
                const $order = $(msg);
                if($order.find('.order').length) {
                    $('.order').html($order.find('.order').html());
                }
            }
        });
    });


    $('.order').on('click', '.js-btn_update_order', function(e) {
        e.preventDefault();
        let order_id = $(this).data('orderId');
        let items = [];
        $('.order .item-cart').each(function(i) {
            let item = {
                "id": $("[name=qty]", this).data('itemId'),
                "qty": $("[name=qty]", this).val(),
            };
            items.push(item);
        });
        let params = {
            items: items
        }
        showLoader();        
        $.ajax({
            method: "POST",
            url: `/orders/update-order/${order_id}`,
            data: params
        })
        .done(function( msg ) {
            hideLoader();
            const $order = $(msg);
            if($order.find('.order').length) {
                $('.order').html($order.find('.order').html());
            }
        });        
    });
    
});