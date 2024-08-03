export async function filterByCommonIds(array1, array2){
    const array2Ids = new Set(array2.map(item => item.id));
    return array1.filter(item => array2Ids.has(item.id));
  };

export async function filterProducts(products, criteriaArray){
  const filteredArray = criteriaArray.filter(item => !item.hasOwnProperty('id'));
  return products.filter(product => {
    return filteredArray.every(criteria => {
      return Object.keys(criteria).every(key => product[key].toLowerCase().includes(criteria[key]));
    });
  });
};

export function ProductSearchHints(product, query, lang, filterAndDisplayProducts){
    var hints = product.filter(function(product){
        return product.product.toLowerCase().includes(query);
    });
    $('#hints').empty();
    if (query.length > 0 && hints.length > 0) {
        hints.forEach(function(hint) {
            $('#hints').append('<div class="hint-item">' + hint.product + `</div>` +
              '<div class="hint-model">' + hint.description + '</div>');
        });
    }
    else{
      $('#hints').append(`<div class="hint-item">${lang === 'ENG' ? 'Not available' : 'Нет в наличии'}</div>` );
    }
    $('.hint-item').on('click', function() {

      if(hints.length > 0){
     
        filterAndDisplayProducts($(this).text(),product,$('.language-selector').val())
        $('#product-search').val($(this).text());
        $('#hints').empty();
      }
      });
     $(document).on('click', function(event) {
    if (!$(event.target).closest('#product-search').length && !$(event.target).closest('#hints').length) {
        $('#hints').empty();
    }
});
}

export function CountComponent(cart){
    const filterCart = cart.filter(cart => cart.lang === 'RUS')
    let quantity = 0;
    let price = 0;
    let discpont = 0;
    let total = 0;
    filterCart.forEach((cart)=>{
          quantity += cart.quantity
          price += parseInt(cart.price) * cart.quantity
          discpont += parseInt(cart.price) / 10 * cart.quantity
          total = price + discpont
    })
    $('.quantity').text(`${quantity}`);
    $('.cost').text(`${price}₽`);
    $('.discount').text(`${discpont}₽`);
    $('.total').text(`${total}₽`); 
  }

  export function UpperLowerQuantity(textsArray) {
    // Remove any existing event handlers to prevent duplicates
    $('.quantity_inner .bt_minus').off('click');
    $('.quantity_inner .bt_plus').off('click');
    $('.quantity_inner .quantity').off('change keyup input click');
  
    $('.quantity_inner .bt_minus').click(function() {
      let productInfo = $(this).data('info');
      let $input = $(this).parent().find('.quantity');
      let count = parseInt($input.val()) - 1;
      count = count < 1 ? 1 : count;
      $input.val(count); // Update the input value
      textsArray.push({ id: productInfo, quantity: parseInt(count) });
    });
  
    $('.quantity_inner .bt_plus').click(function() {
      let productInfo = $(this).data('info');
      let $input = $(this).parent().find('.quantity');
      let count = parseInt($input.val()) + 1;
      count = count > parseInt($input.data('max-count')) ? parseInt($input.data('max-count')) : count;
      $input.val(count); // Update the input value
      console.log(count);
      textsArray.push({ id: productInfo, quantity: parseInt(count) });
    });
  
    $('.quantity_inner .quantity').bind("change keyup input click", function() {
      if (this.value.match(/[^0-9]/g)) {
        this.value = this.value.replace(/[^0-9]/g, '');
      }
      if (this.value == "") {
        this.value = 1;
      }
      if (this.value > parseInt($(this).data('max-count'))) {
        this.value = parseInt($(this).data('max-count'));
      }
    });
  }
  
  export function deleteObjectById(array, key) {
    return array.filter(item => item.key !== key);
}

export function mergeObjectsByQuantity(array) {
    const merged = array.reduce((acc, obj) => {
        const key = JSON.stringify(obj, Object.keys(obj).filter(key => key !== 'quantity'));
        if (acc.has(key)) {
            acc.get(key).quantity += obj.quantity;
        } else {
            acc.set(key, { ...obj });
        }
        return acc;
    }, new Map());
  
    return Array.from(merged.values());
  }