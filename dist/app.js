(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const companies = window.PORTFOLIO.companies.slice(0, 3);
  const profileTokens=tokenize(window.PORTFOLIO.profile.summary);
  $('#profile-linkedin').href=window.PORTFOLIO.profile.linkedin;
  const stages = [
    {key:'description', slug:'overview', label:'Visão geral', id:'tab-overview'},
    {key:'problem', slug:'problem', label:'O desafio', id:'tab-problem'},
    {key:'solution', slug:'solution', label:'A solução', id:'tab-solution'},
    {key:'result', slug:'result', label:'Resultados e aprendizados', id:'tab-result'}
  ];
  let state={type:'home'}, mediaDispose=null, mediaRevision=0;
  const companyOf = () => companies.find(c=>c.id===state.companyId);
  const productOf = () => companyOf()?.products.find(p=>p.id===state.productId);
  const companyHash = company => `#empresa/${encodeURIComponent(company.id)}`;
  const caseHash = (company,product,stage=0,page=0) => `#case/${encodeURIComponent(company.id)}/${encodeURIComponent(product.id)}/${stages[stage].slug}/${page+1}`;
  function element(tag, className, text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;}
  function routeHash(){if(state.type==='home')return '#inicio';if(state.type==='companies')return '#empresas';if(state.type==='company')return companyHash(companyOf());return caseHash(companyOf(),productOf(),state.stage,state.page);}
  function parseHash(hash){
    let parts;try{parts=hash.replace(/^#/,'').split('/').map(decodeURIComponent);}catch{return {type:'home'};}
    if(parts[0]==='empresas'||parts[0]==='contexto')return {type:'companies'};
    const aliases={'empresa-02':'paciente-360','empresa-03':'uzzo'};
    const company=companies.find(c=>c.id===(aliases[parts[1]]||parts[1]));
    if(parts[0]==='empresa'&&company)return {type:'company',companyId:company.id};
    if(parts[0]==='case'&&company){const product=company.products.find(p=>p.id===parts[2]);if(product){const stage=stages.findIndex(s=>s.slug===parts[3]);return {type:'product',companyId:company.id,productId:product.id,stage:Math.max(0,stage),page:Math.max(0,(Number(parts[4])||1)-1)};}}
    for(const c of companies){const product=c.products.find(p=>p.id===parts[0]);if(product)return {type:'product',companyId:c.id,productId:product.id,stage:0,page:0};}
    return {type:'home'};
  }
  function announce(text){$('#announcement').textContent=text;}
  function logoElement(company,compact=false){if(!company.logo)return null;const wrapper=element('span','brand-logo'+(company.logo.symbol?' brand-symbol':'')+(company.logo.square?' brand-square':'')+(compact?' compact-logo':''));const image=element('img');image.src=company.logo.src;image.alt=company.logo.alt;image.decoding='async';wrapper.append(image);return wrapper;}
  function renderNav(){
    const nav=$('#chapter-nav');nav.replaceChildren();
    const link=(hash,number,title,current)=>{const a=element('a');a.href=hash;a.append(document.createTextNode(title));a.dataset.brand=companies.find(c=>companyHash(c)===hash)?.id||'portfolio';if(current)a.setAttribute('aria-current','page');nav.append(a);};
    link('#inicio','00','Resumo Profissional',state.type==='home');
    companies.forEach((company,i)=>link(companyHash(company),`0${i+1}`,company.name,state.companyId===company.id));
    const company=companyOf();
    if(company?.products.length){const box=element('div','product-select');const label=element('label','','PRODUTOS / '+company.name);label.htmlFor='product-select';const select=element('select');select.id='product-select';select.setAttribute('aria-label','Selecionar produto de '+company.name);const first=element('option','','Escolha um produto');first.value='';select.append(first);company.products.forEach(product=>{const option=element('option','',product.shortTitle||product.title);option.value=product.id;option.selected=state.productId===product.id;select.append(option);});select.onchange=()=>{const product=company.products.find(p=>p.id===select.value);if(product)navigate({type:'product',companyId:company.id,productId:product.id,stage:0,page:0});};box.append(label,select);nav.append(box);}
  }
  function renderCompanies(){
    const grid=$('#company-grid');grid.replaceChildren();
    companies.forEach((company,i)=>{const a=element('a','company-card'+(company.pending?' pending':''));a.href=companyHash(company);a.dataset.brand=company.id;const logo=logoElement(company,true);a.append(element('span','',`EMPRESA 0${i+1} / ${company.year}`));if(logo)a.append(logo);a.append(element('h3','',company.name),element('p','',company.pending?'Uma nova história, em breve.':company.role));const foot=element('div');foot.append(document.createTextNode(company.pending?'Em breve':`${company.products.length} ${company.products.length===1?'case':'cases'}`),element('b','','↗'));a.append(foot);grid.append(a);});
  }
  function renderCompany(){
    const company=companyOf();$('#company-number').textContent=`EMPRESA 0${companies.indexOf(company)+1} / 03`;
    $('#company-title').textContent=company.name;$('#company-role').textContent=company.role||'CONTEÚDO EM PREPARAÇÃO';
    $('.company-profile>.company-year')?.remove();const year=element('time','company-year',String(company.year));year.dateTime=String(company.year);year.setAttribute('aria-label','Ano de referência: '+company.year);$('#company-title').after(year);
    $('.company-profile>.brand-logo')?.remove();const logo=logoElement(company);if(logo)$('#company-title').before(logo);
    $('#product-total').textContent=String(company.products.length).padStart(2,'0');$('#company-foot').textContent=company.pending?'O próximo capítulo está em preparação.':`${company.name} / ${company.products.length} ${company.products.length===1?'produto selecionado':'produtos selecionados'}`;
    renderProducts();
  }
  function renderProducts(){
    const company=companyOf();if(!company)return;const list=$('#product-list');list.replaceChildren();
    if(!company.products.length){const empty=element('div','pending-message');empty.append(element('strong','','Novas histórias, em breve.'),document.createTextNode('Os produtos desta empresa serão apresentados aqui.'));list.append(empty);}
    company.products.forEach((product,i)=>{const a=element('a','product-link');a.href=caseHash(company,product);const copy=element('div');copy.append(element('strong','',product.title),element('small','','Abrir case completo'));a.append(element('span','',String(i+1).padStart(2,'0')),copy,element('b','','↗'));list.append(a);});

  }
  function tokenize(text){return String(text||'Conteúdo em preparação.').trim().split(/\r?\n\s*\r?\n/).flatMap((p,paragraph)=>p.trim().split(/\s+/).filter(Boolean).map(text=>({text,paragraph})));}
  function appendTokens(target,tokens){target.replaceChildren();let p=null,paragraph=-1;for(const token of tokens){if(token.paragraph!==paragraph){p=element('p');target.append(p);paragraph=token.paragraph;}p.append(document.createTextNode((p.textContent?' ':'')+token.text));}}
  function fitBio(){const company=companyOf();if(!company)return;appendTokens($('#company-description'),tokenize(company.description||'O conteúdo desta empresa e de seus produtos será incluído em uma próxima atualização.'));$('#company-bio-pager').hidden=true;}
  function updateTabs(){const tabs=$('.case-tabs');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Seções do case');document.querySelectorAll('[data-stage]').forEach((button,i)=>{button.setAttribute('role','tab');button.setAttribute('aria-controls','case-panel');button.setAttribute('aria-selected',String(i===state.stage));button.tabIndex=i===state.stage?0:-1;if(i===state.stage)button.setAttribute('aria-current','location');else button.removeAttribute('aria-current');});$('#case-panel').setAttribute('role','tabpanel');$('#case-panel').setAttribute('aria-labelledby',stages[state.stage].id);}
  function renderCaseContent(){const stage=stages[state.stage],content=$('#reading-content'),product=productOf();const section=element('section','case-section');section.id='case-section-'+stage.key;section.append(element('h3','',stage.label));const text=element('div');appendProductText(text,product[stage.key],product.emphasis?.[stage.key]||[]);section.append(text);content.replaceChildren(section);}
  function appendProductText(target,source,highlights){target.replaceChildren();String(source||'Conteúdo em preparação.').split(/\r?\n\s*\r?\n/).forEach(paragraph=>{const p=element('p');let rest=paragraph.trim();while(rest){let position=-1,phrase='';for(const highlight of highlights){const index=rest.indexOf(highlight);if(index>=0&&(position<0||index<position)){position=index;phrase=highlight;}}if(position<0){p.append(document.createTextNode(rest));break;}if(position>0)p.append(document.createTextNode(rest.slice(0,position)));p.append(element('strong','',phrase));rest=rest.slice(position+phrase.length);}target.append(p);});}
  function setStage(stage,page=0,focus=false){state.stage=stage;state.page=0;updateTabs();renderCaseContent();history.replaceState(null,'',routeHash());$('#case-section-'+stages[stage].key)?.scrollIntoView({behavior:'instant',block:'start'});announce(`${productOf().title}. ${stages[stage].label}.`);if(focus)document.querySelector(`[data-stage="${stage}"]`).focus({preventScroll:true});}
  function renderProduct(){
    const company=companyOf(),product=productOf();
    $('#case-company-link').href=companyHash(company);$('#case-company-link').textContent=`← ${company.name} / Produtos`;
    $('#product-position').textContent=`PRODUTO ${String(company.products.indexOf(product)+1).padStart(2,'0')} / ${String(company.products.length).padStart(2,'0')}`;
    $('#product-company').replaceChildren();const logo=logoElement(company,true);if(logo)$('#product-company').append(logo);$('#product-company').append(document.createTextNode(`${company.name} / ${company.year} / CASE COMPLETO`));$('#product-title').textContent=product.title;updateTabs();
    renderCaseContent();
    $('#reading-controls')?.setAttribute('hidden','');renderMedia(product);
  }
  async function renderMedia(product){
    const revision=++mediaRevision;mediaDispose?.();mediaDispose=null;const mount=$('#media-mount');mount.replaceChildren();
    const media=product.media||{type:'diagram'};$('.product-media').dataset.mediaType=media.type;$('#media-label').textContent=media.label||'Visual';
    $('#media-caption').textContent=media.caption||(media.type==='diagram'?'Esquema conceitual':'');
    if(media.type==='image'&&media.src){const image=element('img','media-image');image.src=media.src;image.alt=media.alt||product.title;image.onerror=()=>{mount.replaceChildren(element('p','media-error','Imagem indisponível. O conteúdo do case continua disponível ao lado.'));};mount.append(image);}
    else if(media.type==='three'){
      try{const {mountProductScene}=await import('./product-scene.js');if(revision!==mediaRevision)return;const dispose=await mountProductScene(mount,{label:media.alt||`Visual 3D de ${product.title}`,variant:media.variant||0});if(revision!==mediaRevision)dispose?.();else mediaDispose=dispose;}
      catch{if(revision===mediaRevision)mount.append(element('p','media-error','Visual 3D indisponível neste navegador.'));}
    }else renderDiagram(mount,media.variant||0);
  }
  function renderDiagram(mount,variant){
    const flows=[
      [['Faturas','Saldos atuais, futuros e em atraso.'],['Parcelas','Parcelamentos ativos também entram.'],['Um contrato','Saldo reunido em um parcelamento.']],
      [['Empréstimo','Contratação do Crédito do Trabalhador.'],['Cofrinho','O valor fica reservado como garantia.'],['Limite','Depende da manutenção do aporte.']],
      [['Compra','Uma transação elegível à vista.'],['Transferir','O pagamento muda de ciclo.'],['Próxima fatura','A compra continua identificada.']],
      [['Compra à vista','Uma transação no crédito.'],['Parcelar','Condições, taxas e juros claros.'],['Acompanhar','Parcelas reconhecíveis nas faturas.']],
      [['Caso clínico','Uma situação virtual humanizada.'],['Decisões','Do diagnóstico ao tratamento.'],['Desfechos','Consequências de curto e longo prazo.']]
    ];
    const flow=flows[variant]||flows[0];let step=0;
    const viewer=element('div','diagram-viewer'),counter=element('span','diagram-step'),symbol=element('span','diagram-symbol','↳'),title=element('strong','diagram-title'),description=element('p','diagram-description'),pager=element('div','diagram-pager');symbol.setAttribute('aria-hidden','true');
    const previous=element('button','','←'),next=element('button','','→');previous.setAttribute('aria-label','Etapa anterior do esquema');next.setAttribute('aria-label','Próxima etapa do esquema');
    const draw=()=>{counter.textContent=`${step+1} / ${flow.length}`;title.textContent=flow[step][0];description.textContent=flow[step][1];previous.disabled=step===0;next.disabled=step===flow.length-1;};
    previous.onclick=()=>{if(step>0){step--;draw();}};next.onclick=()=>{if(step<flow.length-1){step++;draw();}};pager.append(previous,next);viewer.append(counter,symbol,title,description,pager);mount.append(viewer);draw();
  }
  function applyBrand(){const company=companyOf();document.documentElement.dataset.brand=company?.id||'portfolio';if(company)document.documentElement.style.setProperty('--brand',company.brand);else document.documentElement.style.removeProperty('--brand');}
  function navigate(next,{push=true,focus=true}={}){
    state={...next};applyBrand();$('#motion').hidden=!(state.type==='product'&&productOf()?.media?.type==='three');if(state.type!=='product'){mediaRevision++;mediaDispose?.();mediaDispose=null;}
    for(const view of document.querySelectorAll('.view'))view.hidden=view.id!==({home:'home-view',companies:'companies-view',company:'company-view',product:'product-view'})[state.type];
    if(state.type==='companies')renderCompanies();if(state.type==='company')renderCompany();if(state.type==='product')renderProduct();
    renderNav();if(push)history.pushState(null,'',routeHash());
    if(focus)$('#presentation').focus({preventScroll:true});
    announce(state.type==='product'?productOf().title:state.type==='company'?companyOf().name:state.type==='companies'?'Empresas':'Introdução');
    window.scrollTo({top:0,behavior:'instant'});
    fitAll(false);requestAnimationFrame(()=>{if(state.type==='product'&&state.stage>0)setStage(state.stage);});
    window.dispatchEvent(new CustomEvent('portfolio:slide',{detail:{type:state.type}}));
  }
  function fitAll(preserve=true){
    if(state.type==='home')fitProfile(preserve);
    if(state.type==='company')fitBio();
  }
  document.addEventListener('click',event=>{const a=event.target.closest('a[href^="#"]');if(!a)return;if(a.classList.contains('skip-link')){event.preventDefault();$('#presentation').focus({preventScroll:true});$('#presentation').scrollIntoView({block:'start'});return;}event.preventDefault();navigate(parseHash(a.getAttribute('href')));});



  document.querySelectorAll('[data-stage]').forEach((button,i)=>{button.onclick=()=>setStage(i);button.onkeydown=event=>{let index;if(event.key==='ArrowRight')index=(i+1)%4;if(event.key==='ArrowLeft')index=(i+3)%4;if(event.key==='Home')index=0;if(event.key==='End')index=3;if(index!==undefined){event.preventDefault();event.stopPropagation();setStage(index,0,true);}};});


  function fitProfile(preserve=true){
    $('#profile-pager').hidden=true;appendTokens($('#profile-content'),profileTokens);
  }
  const restore=()=>navigate(parseHash(location.hash),{push:false});window.addEventListener('hashchange',restore);window.addEventListener('popstate',restore);
  function setTheme(theme){document.documentElement.dataset.theme=theme;$('#theme').setAttribute('aria-label',theme==='dark'?'Ativar tema claro':'Ativar tema escuro');$('#theme').textContent=theme==='dark'?'☼':'◐';document.querySelector('meta[name="theme-color"]').content=theme==='dark'?'#141516':'#f2f1eb';}
  try{if(localStorage.getItem('portfolio-theme')==='light')setTheme('light');}catch{}
  $('#theme').onclick=()=>{const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';setTheme(theme);try{localStorage.setItem('portfolio-theme',theme);}catch{}window.dispatchEvent(new CustomEvent('portfolio:theme',{detail:{theme}}));};
  window.PORTFOLIO_MOTION_PAUSED=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function updateMotion(){const paused=window.PORTFOLIO_MOTION_PAUSED;$('#motion').setAttribute('aria-pressed',String(paused));$('#motion').setAttribute('aria-label',paused?'Ativar animação 3D':'Pausar animação 3D');$('#motion').title=paused?'Ativar animação 3D':'Pausar animação 3D';$('#motion').textContent=paused?'▷':'Ⅱ';}
  updateMotion();$('#motion').onclick=()=>{window.PORTFOLIO_MOTION_PAUSED=!window.PORTFOLIO_MOTION_PAUSED;updateMotion();window.dispatchEvent(new Event('portfolio:motion'));};
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',event=>{if(event.matches){window.PORTFOLIO_MOTION_PAUSED=true;updateMotion();window.dispatchEvent(new Event('portfolio:motion'));}});
  navigate(parseHash(location.hash),{push:false,focus:false});
})();
