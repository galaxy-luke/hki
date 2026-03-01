const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let original = content;

    // Replace Bootstrap Icons
    content = content.replace(/<link rel="stylesheet" href="https:\/\/cdn\.jsdelivr\.net\/npm\/bootstrap-icons@[^\/]+\/font\/bootstrap-icons\.css">/g, '<link rel="stylesheet" href="plugins/bootstrap-icons/bootstrap-icons.min.css">');

    // Replace FontAwesome
    content = content.replace(/<link rel="stylesheet" href="https:\/\/cdn\.jsdelivr\.net\/npm\/@fortawesome\/fontawesome-free@[^\/]+\/css\/all\.min\.css">/g, '<link rel="stylesheet" href="plugins/fontawesome/css/all.min.css">');

    // Replace Swiper CSS
    content = content.replace(/<link rel="stylesheet" href="https:\/\/cdn\.jsdelivr\.net\/npm\/swiper@11\/swiper-bundle\.min\.css">/g, '<link rel="stylesheet" href="plugins/swiper/swiper-bundle.min.css">');

    // Replace Swiper JS
    content = content.replace(/<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/swiper@11\/swiper-bundle\.min\.js"><\/script>/g, '<script src="plugins/swiper/swiper-bundle.min.js"></script>');

    // Remove google preconnects
    content = content.replace(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\s*/g, '');
    content = content.replace(/<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>\s*/g, '');

    // Replace google fonts CSS
    content = content.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Noto\+Sans\+TC:[^>]+>\s*/g, '<link rel="stylesheet" href="plugins/fonts/fonts.css">\n    ');

    // Sometimes it's written differently in some files in the project
    content = content.replace(/<link\s*href="https:\/\/fonts\.googleapis\.com\/css2\?family=Noto\+Sans\+TC:wght@400;500;600;700&[amp;]*family=Noto\+Serif\+TC:wght@400;500;600;700&[amp;]*display=swap"\s*rel="stylesheet">/g, '<link rel="stylesheet" href="plugins/fonts/fonts.css">');
    content = content.replace(/href="https:\/\/fonts\.googleapis\.com\/css2\?family=Noto\+Sans\+TC:wght@400;500;600;700&[amp;]*family=Noto\+Serif\+TC:wght@400;500;600;700&[amp;]*display=swap"/g, 'href="plugins/fonts/fonts.css"');


    if (content !== original) {
        fs.writeFileSync(f, content);
        console.log(`Updated ${f}`);
    }
});
