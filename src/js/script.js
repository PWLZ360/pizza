/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

const select = {
  templateOf: {
    menuProduct: "#template-menu-product",
    cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  

    cart:{
      productList: '.cart_order_sumary',
      toggleTrigger: '.cart_sumary',
      totalNumber: '.cart_total-number',
      totalPrice: 'cart_total-price strong, .cart_order-total .cart_order-price-sum strong',
      subtotalPrice: '.cart_order-subtotal .cart_order-price-sum strong',
      form: '.cart_order',
      formSubmit: '.cart_order [type=submit]',
      phone: '[name="phone"]',
      address: '[name="address"]',

    },
    cartProduct:{
      amountWidget: '.widget-amount',
      price: '.cart_product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
}; 

    const classNames = {
      menuProduct: {
        wrapperActive: 'active',
        imageVisible: 'active',
      },
      cart: {
        wrapperActive: 'active',
      },
    };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),

    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

  class Product{
    constructor(id, data){
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;
      

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

      //console.log('new Product:', thisProduct);

    }
    renderInMenu(){
      const thisProduct = this;
      
      //generowanie HTML
      const generatedHTML = templates.menuProduct(thisProduct.data);

      //Tworzenie elementu DOM
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      //znalezienie kontenera menu
      const menuContainer = document.querySelector(select.containerOf.menu);
      //dodajemy stworzony element na strone
      menuContainer.appendChild(thisProduct.element);
    }

    getElements(){
     const thisProduct = this;

    

     thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
     thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
     thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
     thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
     thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      //console.log('selectProduct', thisProduct);
     thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    
     thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    
      

    }

    initAccordion(){
      const thisProduct = this;

      /*find clickable trigger (the element should react to clicking)*/
      

      /* START add event listener to clickable trigger on event click*/
      thisProduct.accordionTrigger.addEventListener('click', function(event){

        /*prevent default action for event */
        event.preventDefault();

        /*find active product (preotuct that has active class)*/
        const activeProduct = document.querySelector('.product.active');

        /*if there is active product and it's not thisProduct.element, remove class active from  */
        
        if(activeProduct && activeProduct !== thisProduct.element){
            activeProduct.classList.remove('active');
        }

        /*toggle active class on thisProduct.element*/
        thisProduct.element.classList.toggle('active');

      });

    }

    initOrderForm(){
      const thisProduct = this;
     // console.log("initOrderForm()");

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();

      });

      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click',function(event){
        event.preventDefault();
        thisProduct.processOrder();

      });

      

      

    }

    processOrder(){
      const thisProduct = this;
     
      //convert form to object structure e.g {sauce: [tomato], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData:', formData);

      //set price to default price
      let price = thisProduct.data.price;

      //for every category(param)
      for(let paramId in thisProduct.data.params){
        //derermine param value e.g paramId = 'toppings', param = {label: 'Toppings, type:checkbox...}
        const param = thisProduct.data.params[paramId];
       //console.log(paramId, param);

        //for every option in category
        for(let optionId in param.options){
          //determine options value e.g. optionsID = 'olives', options ={leabel: 'Olives', price: 2, defaulf: 'true'}
          const option = param.options[optionId];
         // console.log(optionId, option); 

          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

          if(optionSelected && !option.default){
            price += option.price;
          }
          if(!optionSelected && option.default){
            price -= option.price;
          }
          
          const optionImage = thisProduct.imageWrapper.querySelector('.'+ paramId + '-' + optionId );

          if(optionImage){
            if(optionSelected){
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            }else{
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }

        

        
      }
      price *= thisProduct.amountWidget.value;
      //update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;

    }

    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      })
      
    }


  }

  class AmountWidget{
    constructor(element){
      const thisWidget = this;

      console.log('AmountWidget:', thisWidget);
      console.log('constructor arguments', element);


      thisWidget.getElements(element);
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();
    }

    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value){
      const thisWidget = this;

      const newValue =parseInt(value);

      //TODO Add Validation
      if( !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax ){
        thisWidget.value = newValue;
        thisWidget.announce();
      }

      
      thisWidget.input.value = thisWidget.value;
      
    }

    initActions(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);

      });

      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value-1);

      });

      thisWidget.linkIncrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);

      });

    }

    announce(){
      const thisWidget = this;

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);

      console.log('new Cart', thisCart);


   }


    getElements(element){
      const thisCart =this;
      thisCart.dom = {};

      thisCart.dom.wrapper = element;


    }

  }

  const app = {
    initMenu: function(){
      const thisApp = this;

      console.log('thisApp.data:', thisApp.data);

      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }

    },

    initData: function(){
      const thisApp = this;
      thisApp.data = dataSource;
    },
    
    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();


}
