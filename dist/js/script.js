/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

const select = {
  templateOf: {
    menuProduct: "#template-menu-product",
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
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
      thisProduct.processOrder();

      console.log('new Product:', thisProduct);

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
     thisProduct.from = thisProduct.element.querySelector(select.menuProduct.form);
     thisProduct.formInputs = thisProduct.from.querySelectorAll(select.all.formInputs);
     thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
     thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      console.log('selectProduct', thisProduct);

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
      console.log("initOrderForm()");

      thisProduct.from.addEventListener('submit', function(event){
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
      console.log("processOrder()");

      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('formData', formData);
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
    
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();


}
