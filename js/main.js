import { cart, productsRUS,productsENG, saveToStorage } from "./product-data.js";
import { filterByCommonIds, filterProducts, ProductSearchHints,CountComponent,
  UpperLowerQuantity, deleteObjectById, mergeObjectsByQuantity  } from './FunctionTool.js'

let textsArray = [];
let PriceRange = [];
$(document).ready(function() {
  let productArray = productsRUS;
  function debounce(func, delay) {
    let debounceTimer;
    return (...args) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
  }
  function handleSliderChange(event) {
    const target = $(event.target);
    const newValue = target.val();
    let sliderType = '';
    
    if (target.hasClass('lower-range')) {
      sliderType = 'lower';
    } else {
      sliderType = 'upper';
    }
    
    PriceRange.push({
      sliderType: sliderType,
      price: Math.round(newValue)
    });
  }


  
  $('.lower-range').on('input', debounce(handleSliderChange, 500));
  $('.upper-range').on('input', debounce(handleSliderChange, 500));
  
  
  $('.lower-range').on('input', function() {
    let lowerValue = $(this).val();
    let roundUpperValue = Math.round(lowerValue);
    $('#lowerValue').text(roundUpperValue);
});

$('.upper-range').on('input', function() {
    let upperValue = $(this).val();
    let roundUpperValue = Math.round(upperValue);
    $('#upperValue').text(roundUpperValue);
});



$(document).ready(function() {
    $('.clickable').click(function() {
    const componentName = $(this).data('translate');
    const newKey = $(this).data('component');
    let componentObject = {
      [newKey]:componentName,
    }
    textsArray.push(componentObject)
    console.log(textsArray) 
});
});
  $('.language-selector').on('change', function() {
    let selectedLang = $(this).val() || 'RUS'
    if (selectedLang === 'ENG') {
      productArray = productsENG;
    } else {
      productArray = productsRUS;
    }
    Basket(selectedLang, cart)
    filterAndDisplayProducts($('.search').val(), productArray, selectedLang);
  });
  $('.filter__btn').on('click', ()=>{
    filterAndDisplayProducts($('.search').val(),productArray,$('.language-selector').val())
  })
  $('.search').on('input', function() {
    const searchQuery = $(this).val().toLowerCase();
    filterAndDisplayProducts(searchQuery, productArray, $('.language-selector').val());
    ProductSearchHints(productArray, searchQuery,$('.language-selector').val(), filterAndDisplayProducts)
  });
  filterAndDisplayProducts('', productArray, 'RUS')
  Basket($('.language-selector').val(), cart)
});  



async function filterAndDisplayProducts(searchQuery, productArray, lang) {
  let PriceArrayLength = PriceRange.length;
    const NoProduct = lang == 'RUS' ? '<h1>Нет в наличии</h1>' : '<h1>Not available</h1>' 
    let result = {};
      PriceRange.forEach(item => {
        result[item.sliderType] = item;
      });
   
      const $container = $('.product-container');
    const $noProduct = $('.no-product')
    $container.empty();
    $noProduct.empty();
    const filteredSearchProducts = productArray.filter(product => {
      if (searchQuery) {
        return product.product.toLowerCase().includes(searchQuery.toLowerCase());
      }
      else return true
    });
    const filteredPriceSearchProducts = filteredSearchProducts.filter(product => {
    if (PriceArrayLength) {
      return product.price > result.lower.price && product.price < result.upper.price;
    }
    else return true
  })
  
      

    const filteredProduct = await filterProducts(productsENG, textsArray);
    const FinalfilterById =  await filterByCommonIds(filteredPriceSearchProducts, filteredProduct);
    let filteredProductsLength = FinalfilterById.length;
    
    console.log(FinalfilterById)
    console.log(textsArray)
    filteredProductsLength > 0 ?
    FinalfilterById.forEach((product) => {
      const productHTML = `
        <div class="slider__product" data-translate>
          <img class="image" src="images/product-images/${product.image}.png" alt="news" />
          <div class="slider__product-content">
            <h3 class="slider__product-text">${product.product}</h3>
            <p class="slider__product-descr">${product.description}</p>
            <h4 class="slider__product-name">${product.manufacturer} <span>${product.country}</span></h4>
            <h5 class="slider__product-kilogramm">${product.weight}</h5>
            <p class="slider__product-price"><span class="slider-price">${product.price}₽</span></p>
            <div class="slider__buttons">
              <div class="quantity_inner">
                <button data-info="${product.product}" class="bt_minus">
                  <svg viewBox="0 0 24 24">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                <input type="text" value="1" size="2" class="quantity" data-max-count="20" />
                <button data-info=${product.product} class="bt_plus">
                     <svg viewBox="0 0 24 24">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                              </svg>
                </button>
              </div>
              <a data-product="${product.id}" href="/basket"  class="slider__product-btn1">${product.add_to_cart}</a>
            </div>
          </div>
        </div>
      `;
      $container.append(productHTML);
    
    }) :   $noProduct.append(NoProduct);



    UpperLowerQuantity(textsArray)
    $('.slider__product-btn1').on('click', function() {
      const product = $(this).data('product');
      const correctProductRus = productsRUS.filter(i=> i.id === product);
      const correctProductEng = productsENG.filter(i=> i.id === product);
      const quantity = textsArray
      const quantityLength = quantity.length - 1
      const correctQuantity = quantity.length > 0 ? quantity[quantityLength].quantity : 1

      cart.push({
        lang:"RUS",
        ...correctProductRus[0],
        quantity:correctQuantity
      })
      cart.push({
        lang:"ENG",
        ...correctProductEng[0],
        quantity:correctQuantity
      })
      saveToStorage(cart)
     
    });
}
console.log(cart)



function Basket(lang, cart){
  let cartFilter = mergeObjectsByQuantity(cart);
    const basketFilter = cartFilter.filter(i => i.lang === lang);
 
    const noBasket = lang === 'ENG' ?   
    `
    <section class="basket">
    <div class="container">
      <div class="basket__wrapper">
        <h3 class="basket__title">Your basket is empty!</h3>
        <p class="basket__descr">But it's easy to fix! Go shopping or log in to see items already added</p>
        <a href="/catalog" class="basket__link">To catalog</a>
      </div>
    </div>
  </section>`
  :
    `<section class="basket">
      <div class="container">
        <div class="basket__wrapper">
          <h3 class="basket__title">Ваша корзина пуста!</h3>
          <p class="basket__descr">Но это легко исправить! Отправляйтесь за покупками или авторизуйтесь, чтобы увидеть уже добавленные товары</p>
          <a href="/catalog" class="basket__link">В каталог</a>
        </div>
      </div>
    </section>`;
    
    const $container = $('.buy__container');
    
    $container.empty();
   

    if (basketFilter.length > 0) {
      basketFilter.forEach((product, index) => {
        const productHTML = `
         <div class="buy__blog">
                    <input type="checkbox" name class="buy__input" />
               <img class="buy__img image-basket"  src="images/product-images/${product.image}.png" alt="news"  />
               <div class="buy__text">
                     <h3 class="buy__title">${product.product}</h3>
                      <h6 class="buy__descr">Номер CAS: 1379403-11-${index}</h6>
                      <div class="mobile-quanity">
                          <h6 class="quantity-mobile">${product.quantity}X</h6>             
                          <p class="buy__number">${product.price}₽</p>    
                    </div>
                      <a href="#">
                        <p data-remove="${product.key}" data-translate="remove" class="buy__remove remove">Удалить</p>
                      </a>
                    </div>
                    <div class="quantity-number">
                        <div class="quantity_inner">
                            <input type="text" value="${product.quantity}X" size="2" class="quantity" data-max-count="20" />
                          </div>
                          <p class="buy__number">${product.price} ₽</p>    
                    </div>
                 
                  </div>
        `;
        $container.append(productHTML);
      });
    } else {
      $container.append(noBasket);
    }
    $('.remove').on('click', function() {
            const itemKey = $(this).data('remove');
            let filterCart = deleteObjectById(cart, itemKey);
            Basket($('.language-selector').val(), filterCart)
            CountComponent(filterCart)
            saveToStorage(filterCart);
        });
    
    
}


(function($) {
  $(function() {
    $("ul.stack__list").on("click", "li:not(.active)", function() {
      $(this)
        .addClass("active")
        .siblings()
        .removeClass("active")
        .closest("div.stack__blog")
        .find("div.tabs__content")
        .removeClass("active")
        .eq($(this).index())
        .addClass("active");
    });
  });
})(jQuery);

jQuery(document).ready(function($) {
  $('.usefull-links').click(function() {
    $(this).parents('.bg').find('.links').toggleClass('open');
    $(this).parents('.bg').find('.flaticon-down-arrow').toggleClass('open');
  });
  $('.usefull-links1').click(function() {
    $(this).parents('.bg').find('.links1').toggleClass('open');
    $(this).parents('.bg').find('.flaticon-down-arrow1').toggleClass('open') .style.height = "23px";
  });
});

  $(function() {
  $('.product__container').slick({
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    variableWidth: true,
    prevArrow: '<button type="button" class="slick-arrows slick-prev"><img src="images/next.svg" alt="prev"/></button>',
    nextArrow: '<button type="button" class="slick-arrows slick-next"><img src="images/prev.svg" alt="next"/></button>',
    responsive: [{
      breakpoint: 475,
      settings: {}
    }, ]
  });
  $(".slider-for").slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    speed: 500,
    arrows: false,
    fade: true,
    asNavFor: ".slider-nav"
  });
  $(".slider-nav").slick({
    vertical: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    speed: 500,
    asNavFor: ".slider-for",
    dots: true,
    centerMode: true,
    focusOnSelect: true,
    slide: "div",
    prevArrow: '<button type="button" class="slick-arrows slick-prev"><img src="images/next.svg" alt="prev"/></button>',
    nextArrow: '<button type="button" class="slick-arrows slick-next"><img src="images/prev.svg" alt="next"/></button>',
  });
  $('.news__container').slick({
    dots: true,
    infinite: true,
    autoplay: true,
    speed: 2000,
    slidesToShow: 1,
    slidesToScroll: 1,
    variableWidth: true,
    prevArrow: '<button type="button" class="slick-arrows slick-prev"><img src="images/next-arrow.png" alt="prev"/></button>',
    nextArrow: '<button type="button" class="slick-arrows slick-next"><img src="images/arrow-about.png" alt="next"/></button>',
    responsive: [{
      breakpoint: 475,
      settings: {}
    }, ]
  });
  $('.directions__container').slick({
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: true,
    arrows: false,
    variableWidth: false,
    responsive: [{
      breakpoint: 475,
      settings: {
        slidesShow: 4,
      },
    }, 
  ]
  });

});

CountComponent(cart)



const mobileNavButton = document.querySelector('.mobile-nav-button');
const mobileNavIcon = document.querySelector('.mobile-nav-button__icon');
const mobileNav = document.querySelector('.mobile-nav');
const header = document.querySelector('.header');
mobileNavButton.addEventListener('click', function () {
  mobileNavIcon.classList.toggle('active');
  mobileNav.classList.toggle('active');
});





// //popup
var popup = document.querySelector(".popup");
var btns = document.querySelectorAll(".btn-modal");
var close = document.querySelector(".close");

btns.forEach(btns => btns.addEventListener('click', (e) => {
  e.preventDefault()
  popup.classList.remove("hidden");
}));

popup.addEventListener("click", function(event) {
  let e = event || window.event
  if (e.target == this) {
    popup.classList.add("hidden");
  }
});

close.addEventListener("click", function(event){
    event.preventDefault();
    popup.classList.add("hidden");
});
// переключение языка
$('#input0').click(function() {
if($("select#input0 :selected").val() == "RUS") {
$("select#input0").attr('style', "background-image:url(images/Hicon.png); background-repeat: no-repeat; padding-left: 29px;padding-top:-10px");
}
if($("select#input0 :selected").val() == "ENG") {
$("select#input0").attr('style', "background-image:url(images/Hicon.png); background-repeat: no-repeat;  padding-left: 29px;padding-top:-10px");
}
});
let text = document.querySelector(".dropbtn__lang");
let elem = document.querySelector('#input0');

function changeText(ev) {
  if(ev.getAttribute('data-show') === "true") {
      ev.innerHTML = "Скрыть"  + '<img style="width: 24px; z-index: -1; margin-left:15px;" src="images/arrows1.png">';
      ev.setAttribute('data-show', "false"); 
  }
  else {
    ev.innerHTML = "Читать еще" + '<img style="width: 24px; z-index: -1; margin-left:4px;" src="images/arrow.png">';
      ev.setAttribute('data-show', "true"); 
  }
}

function lang1(sel) {
  text.textContent = sel
}
//

jQuery(document).ready(function() {
  $('.upper').on('input', setFill);
  $('.lower').on('input', setFill);

  var max = $('.upper').attr('max');
  var min = $('.lower').attr('min');

  function setFill(evt) {
    var valUpper = $('.upper').val();
    var valLower = $('.lower').val();
    if (parseFloat(valLower) > parseFloat(valUpper)) {
      var trade = valLower;
      valLower = valUpper;
      valUpper = trade;
    }
    
    var width = valUpper * 100 / max;
    var left = valLower * 100 / max;
    $('.fill').css('left', 'calc(' + left + '%)');
    $('.fill').css('width', width - left + '%');
    
    // Update info
    if (parseInt(valLower) == min) {
      $('.easy-basket-lower').val('0');
    } else {
      $('.easy-basket-lower').val(parseInt(valLower));
    }
    if (parseInt(valUpper) == max) {
      $('.easy-basket-upper').val('5000');
    } else {
      $('.easy-basket-upper').val(parseInt(valUpper));
    }
    $('.histogram-list li').removeClass('ui-histogram-active');
  }
  
  // изменяем диапазон цен вручную
  $('.easy-basket-filter-info p input').keyup(function() {
    var valUpper = $('.easy-basket-upper').val();
    var valLower = $('.easy-basket-lower').val();
    var width = valUpper * 100 / max;
    var left = valLower * 100 / max;
    if ( valUpper > 5000 ) {
      var left = max;
    }
    if ( valLower < 0 ) {
      var left = min;
    } else if ( valLower > max ) {
      var left = min;
    }
    $('.fill').css('left', 'calc(' + left + '%)');
    $('.fill').css('width', width - left + '%');
    // меняем положение ползунков
    $('.lower').val(valLower);
    $('.upper').val(valUpper);
  });
  $('.easy-basket-filter-info p input').focus(function() {
    $(this).val('');
  });
  $('.easy-basket-filter-info .iLower input').blur(function() {
    var valLower = $('.lower').val();
    $(this).val(Math.floor(valLower));
  });
  $('.easy-basket-filter-info .iUpper input').blur(function() {
    var valUpper = $('.upper').val();
    $(this).val(Math.floor(valUpper));
  });
  $('.histogram-list li').click(function() {
    $('.histogram-list li').removeClass('ui-histogram-active');
    var range_from = $(this).attr('price-range-from');
    var range_to = $(this).attr('price-range-to');
    var width = range_to * 100 / max;
    var left = range_from * 100 / max;
    $('.easy-basket-lower').val(range_from);
    $('.easy-basket-upper').val(range_to);
    $('.fill').css('left', 'calc(' + left + '%)');
    $('.fill').css('width', width - left + '%');
    $('.lower').val(range_from);
    $('.upper').val(range_to);
    $(this).addClass('ui-histogram-active');
  });
});
$('.filter__close').on('click',()=>window.location.reload())