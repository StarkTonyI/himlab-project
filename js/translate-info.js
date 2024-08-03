$(document).ready(function() {
  const jsonFile = `json-data/${$('[data-json]').attr('data-json')}-data.json`;
  $.getJSON(jsonFile, function(translations) {
    $('.language-selector').on('change', function() {
      const selectedLang = $(this).val();
      console.log(`Language changed to: ${selectedLang}`);
      applyTranslations(selectedLang, translations);
    });
    const defaultLang = 'RUS';
    applyTranslations(defaultLang, translations);
  });

  function applyTranslations(lang, translations) {
    $('[data-translate]').each(function() {
      const key = $(this).attr('data-translate');
      const elementType = $(this).prop('tagName').toLowerCase();
      if (elementType === 'input' && $(this).attr('placeholder')) {
        if (translations[lang] && translations[lang][key]) {
          $(this).attr('placeholder', translations[lang][key]);
        } else {
//            console.log('Error')
        }
      } else {
        //console.log('Error')
        if (translations[lang] && translations[lang][key]) {
          $(this).text(translations[lang][key]);
        } else {
          //console.log('Error')
        }
      }
    });
  }
})