(function(){
//   ADD THIS TO THE BOTTOM OF A WORD DOC SAVED AS A FILTERED HTML  ---> <script src="./src/index-0.1.js"></script>
//window.addEventListener("scroll", () => { document.body.style.setProperty("--scroll", window.pageYOffset / (document.body.offsetHeight - window.innerHeight));  }, false);

document.querySelector('head').innerHTML = '<title>How Wealthy Investors are Making Millions Exploiting Illinois Property Tax Law</title>'; // remove 

document.querySelectorAll('style').forEach(el => el.remove); // Remove all inline styles        
document.querySelector('script').remove; // Remove all Script tags

// Functions
const 
kebabize = (str) => str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase()),
removeClassPrefix = (node, prefix) => {
  if (node.className !== "" ){
	node.className = node.className.replace(prefix,'' );
  node.className =  kebabize(node.className)
	return (node);}
},
removeClassByPrefix =  (node, prefix) => {
        var regx = new RegExp('\\b' + prefix + '[^ ]*[ ]?\\b', 'g');
        node.className = node.className.replace(regx, '');
        return node;
    },
addClassByPrefix =  (node, prefix, newclass) => {
        document.querySelectorAll(node).forEach( el =>
          {if ( el.className.includes(prefix)) {el.classList.add(newclass)} }
        )
        return node;
    },  
wrapDivs = (el,i) => {
      const firstDiv = document.querySelectorAll('p.table-title')[i];
    const secondDiv =  document.querySelectorAll('p.table-title+*')[i] //document.querySelectorAll('p.table-title')[i];       //el.innerHTML       //"<div>document.querySelectorAll('p.table-title+table')[i].innerHTML</div>";
    const threeDiv =  document.querySelectorAll('p.table-title+*+p')[i]
    const wrapper = document.createElement("div");
    el.insertAdjacentElement('beforeBegin', wrapper)
    wrapper.setAttribute("id", "wrapper-"+i);
    wrapper.setAttribute("class", "wrapper");
    wrapper.appendChild(firstDiv);
     try { wrapper.appendChild(secondDiv);
       wrapper.appendChild(threeDiv)
      }
     catch {}
  },
  wrapSameClass = (classMatch) => { //wraps all items 
    document.querySelectorAll(classMatch).forEach((el,i) => {
        if (i==0) {
    wrapper = document.createElement('div');
    wrapper.classList.add(classMatch+'-wrap');
    el.insertAdjacentElement('beforeBegin', wrapper)
  }
  wrapper.appendChild(el);
})
  },
  removeChildItems = (target,selector) => {
    document.querySelectorAll(target+" "+selector).forEach(el=>{
      el.outerHTML = ""})
  }
  function wrapConsecutiveElementsByClass(className) {
    const elements = document.querySelectorAll(`.${className}`);
    let currentWrapper = null;
  
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const prevElement = elements[i - 1];
      
      if (element.classList.contains(className)) {
        if (prevElement && prevElement.classList.contains(className) && prevElement.nextSibling === element) {
          if (!currentWrapper) {
            currentWrapper = document.createElement('ul');
            element.parentNode.insertBefore(currentWrapper, element);
          }
          const listItem = document.createElement('li');
          listItem.classList.add(className);
          listItem.innerHTML = element.innerHTML;
          currentWrapper.appendChild(listItem);
          element.parentNode.removeChild(element);
        } else {
          currentWrapper = null;
        }
      } else {
        currentWrapper = null;
      }
    }
  }
  
  // end functions **********************

  // Remove Mso prefix and skewer
    document.querySelectorAll('*').forEach(el => removeClassPrefix(el,'Mso'));
    
    
   addClassByPrefix('p','list','list-bullet');

    // Remove inline attributes
    document.querySelectorAll('*').forEach(el => {
        const attrs = ['title','nowrap','cellpadding','cellspacing','border','valign','width','style'];
      attrs.forEach(attr => el.removeAttribute(attr));
    });

    ///remove empty divs and Spans
document.querySelectorAll('div,span').forEach(el =>{
if (el.innerHTML === '' || el.innerHTML===' ' ) {el.remove();};}
);

// remove inline styles
    document.querySelectorAll('[style]').forEach(el => {
        el.removeAttribute('style');
        el.removeAttribute('width');
        el.removeAttribute('align');
    });


// remove word bogstandard style
    document.querySelectorAll('p.normal', 'div.normal', 'table').forEach(el => {
      el.removeAttribute('class') } );
    
    



document.querySelectorAll('div').forEach((el,i) => {
  removeClassByPrefix(el, 'word-section');
  if (1) {
     el.classList.add('section-'+i);
    el.classList.add('section')} else  
  if (el.classList.length === 0) {el.removeAttribute('class') }
} );

document.querySelectorAll('p').forEach((el,i) => {
  removeClassByPrefix(el, 'word-sect');
  if (0) { el.classList.add('para-'+i);} else  
  if (el.classList.length === 0) {el.removeAttribute('class') }
} );

document.querySelectorAll('table').forEach((el,i) => {
  //removeClassByPrefix(el, 'Mso');
  if (0) {el.classList.add('table-'+i);} else
  if (el.classList.length === 0) {el.removeAttribute('class') }
} );


document.querySelectorAll('.list-bullet span').forEach(el => {el.remove() } );
document.querySelectorAll('p.Publishwithline').forEach(el => {el.remove() } );


//alert(document.querySelectorAll('p.table-title+table')[0].innerHTML);

document.querySelectorAll('p.table-title').forEach((el,i) => { wrapDivs(el,i)})

document.querySelectorAll('div p.caption').forEach(el => {
  try {el.previousElementSibling.append(el)
} catch {} } );
 
document.querySelectorAll('p.table-title').forEach(el => {el.classList.remove("table-title");el.classList.add("image-header") } );
//document.querySelectorAll('p.WordSection1').forEach(el => {el.classList.remove("table-title");el.classList.add("image-header") } );
document.querySelectorAll('.FootnoteReference').forEach(el => {el.classList.remove("FootnoteReference");el.classList.add("footnote-ref") } );

const contentdiv = document.createElement("div");
// MOVE ALL ITEMS INTO MAIN PARENT DIV


contentdiv.classList.add("pp-page-content") ;

while(document.body.childElementCount >= 2) {
    contentdiv.appendChild( document.body.firstChild);
}

const headerdiv = document.createElement("div");
const footerdiv = document.createElement("div");
headerdiv.innerHTML = 
`<div class = 'pp-header-content'>
    <div class='header-icon'>
    </div><div class = 'pp-header-text-content'>
    <div class='header-title'>
    ${document.currentScript.getAttribute('kind')}
    </div>
    <div class='header-sub-title'>
      Insights from the Cook County Treasurer's Office
    </div></div>
  </div>`;

const ppdiv = document.createElement("pp-div");

headerdiv.classList.add("pp-header");
footerdiv.classList.add("pp-footer");

if ( document.currentScript.getAttribute('kind') === "primer"){
  headerdiv.classList.add("report");
  footerdiv.classList.add("report");}


document.querySelector('body').appendChild(document.createElement("pp-div"));
;
document.querySelector('pp-div').appendChild(headerdiv);
document.querySelector('pp-div').appendChild(contentdiv)
document.querySelector('pp-div').appendChild(footerdiv);

document.querySelectorAll("[class^='list-']").forEach(el => {el.classList=''; el.setAttribute('class','list-bullet');})

addClassByPrefix('p',"toc","toc-base",);
wrapSameClass('toc-base');


//
//
//
//[class^='list-']

removeChildItems(".toc-base","img");


document.querySelectorAll('.publishing-comments').forEach(el => el.outerHTML='');

// Add our CSS
document.getElementsByTagName("head")[0].insertAdjacentHTML(
  "beforeend",
  `<link rel="stylesheet" href="./src/pp-styles.css" />`);
  document.getElementsByTagName("head")[0].insertAdjacentHTML(
  "beforeend",
  `<link rel="preconnect" href="https://fonts.googleapis.com"> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin> <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700;900&display=swap" rel="stylesheet">`);


  document.querySelectorAll('.superscript>.superscript').forEach(el =>{
    el.classList.remove("superscript")
  })

/*   document.querySelectorAll(".list-bullet").forEach(el =>
    {
      const newItem = document.createElement('li');
      el.(newItem)

    }) */

    wrapConsecutiveElementsByClass('list-bullet')

}())
