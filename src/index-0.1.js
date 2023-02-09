//<script>
(function(){



//   ADD THIS TO THE BOTTOM OF A WORD DOC SAVED AS A FILTERED HTML  ---> <script src="./src/index-0.1.js"></script>

window.addEventListener(
  "scroll",
  () => {
    document.body.style.setProperty(
      "--scroll",
      window.pageYOffset / (document.body.offsetHeight - window.innerHeight)
    );
  },
  false
);

document.querySelectorAll('style').forEach(el =>   el.innerText = ""  )         
document.querySelector('script').remove

    function removeClassByPrefix(node, prefix) {
        var regx = new RegExp('\\b' + prefix + '[^ ]*[ ]?\\b', 'g');
        node.className = node.className.replace(regx, '');
        return node;
    }


    document.querySelectorAll('table').forEach(el => {
      el.removeAttribute('cellpadding'); 
           el.removeAttribute('cellspacing');
           el.removeAttribute('border');
           
    });

    document.querySelectorAll('caption').forEach(el => {
      //el.parentElement.parentElement.insertBefore(el,el.parentElement)
     console.log( el );
    
     // el.outerHTML=el.innerHTML
    
    })

    //document.getElementById("mydiv").outerHTML = document.getElementById("mydiv").innerHTML


    document.querySelectorAll('[style]').forEach(el => {
        el.removeAttribute('style');
        el.removeAttribute('width');
        el.removeAttribute('align');
    });
    //document.querySelectorAll('[style]').forEach(el => el.removeAttribute('width'));
    //document.querySelectorAll('MsoNormal').forEach(el => el.parentNode.removeChild(el));
    document.querySelectorAll('p.MsoNormal', 'div.MsoNormal', 'table').forEach(el => {el.removeAttribute('class') } );
document.querySelectorAll('p.MsoCaption').forEach(el => {el.classList.remove("MsoCaption");el.classList.add("caption") } );

document.body.innerHTML = document.body.innerHTML.replace('�', '&rsquo;');

document.querySelectorAll('div').forEach((el,i) => {
  removeClassByPrefix(el, 'WordSect');
  el.classList.add('section-'+i);
} );

document.querySelectorAll('p').forEach((el,i) => {
  removeClassByPrefix(el, 'WordSect');
  el.classList.add('para-'+i);
} );

document.querySelectorAll('table').forEach((el,i) => {
  removeClassByPrefix(el, 'Mso');
  el.classList.add('table-'+i);
} );


//removeClassByPrefix('div', 'WordSect');
//removeClassByPrefix('p', 'WordSection');

////const tempDiv = document.createElement('pp-div');
//document.querySelectorAll('body').forEach(el => el.insertAdjacentElement ('beforeBegin', tempDiv) );

//const myCustomElement = document.a ('my-custom-element');
//document.appendChild(myCustomElement);


document.querySelectorAll('p.Publishwithline').forEach(el => {el.remove() } );

function wrapDivs(el,i) {
///alert(document.querySelectorAll('p.TableTitle+table')[i] );
  const firstDiv = document.querySelectorAll('p.TableTitle')[i];
  const secondDiv =  document.querySelectorAll('p.TableTitle+*')[i] //document.querySelectorAll('p.TableTitle')[i];       //el.innerHTML       //"<div>document.querySelectorAll('p.TableTitle+table')[i].innerHTML</div>";
  const threeDiv =  document.querySelectorAll('p.TableTitle+*+p')[i]
  const wrapper = document.createElement("div");
  el.insertAdjacentElement('beforeBegin', wrapper)
  wrapper.setAttribute("id", "wrapper");
  wrapper.appendChild(firstDiv);
   try { wrapper.appendChild(secondDiv);
     wrapper.appendChild(threeDiv)}
   catch {console.log(i)}

  /*document.body.insertBefore(wrapper, document.body.firstChild); */
}
//wrapDivs()

//alert(document.querySelectorAll('p.TableTitle+table')[0].innerHTML);

document.querySelectorAll('p.TableTitle').forEach((el,i) => {
 wrapDivs(el,i)})

 
 
document.querySelectorAll('p.TableTitle').forEach(el => {el.classList.remove("TableTitle");el.classList.add("image-header") } );
document.querySelectorAll('p.WordSection1').forEach(el => {el.classList.remove("TableTitle");el.classList.add("image-header") } );
document.querySelectorAll('.MsoFootnoteReference').forEach(el => {el.classList.remove("MsoFootnoteReference");el.classList.add("footnote-ref") } );

const contentdiv = document.createElement("div");
// MOVE ALL ITEMS INTO MAIN PARENT DIV


contentdiv.classList.add("pp-page-content") ;

while(document.body.childElementCount >= 2) {
    contentdiv.appendChild( document.body.firstChild);
}

const headerdiv = document.createElement("div");
const footerdiv = document.createElement("div");


const ppdiv = document.createElement("pp-div");
headerdiv.classList.add("pp-header");
footerdiv.classList.add("pp-footer");

document.querySelector('body').appendChild(document.createElement("pp-div"));
;
document.querySelector('pp-div').appendChild(headerdiv);
document.querySelector('pp-div').appendChild(contentdiv)
document.querySelector('pp-div').appendChild(footerdiv);


// Add our CSS
document.getElementsByTagName("head")[0].insertAdjacentHTML(
  "beforeend",
  "<link rel=\"stylesheet\" href=\"./src/pp-styles.css\" />");

}())
