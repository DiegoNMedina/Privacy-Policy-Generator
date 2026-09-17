/* Browser UI only; policy generation and validation are pure functions. */
(() => {
  const $=id=>document.getElementById(id), {catalog,presets}=PolicyCatalog, engine=PolicyEngine;
  let currentStep=1,currentTab='preview',result;
  $('features').innerHTML=Object.entries(catalog).map(([key,f])=>`<label class="option"><input type="checkbox" name="features" value="${key}"><span><strong>${f.label}</strong><br><span class="small">${f.hint}</span></span></label>`).join('');
  function data(){
    const d={};
    document.querySelectorAll('#generator input[id], #generator select[id], #generator textarea[id]:not([readonly])').forEach(el=>d[el.id]=el.type==='checkbox'?el.checked:el.value.trim());
    for(const name of ['features','contactFields'])d[name]=[...document.querySelectorAll(`input[name="${name}"]:checked`)].map(el=>el.value);
    return d;
  }
  function sync(){
    const d=data(), has=f=>d.features.includes(f);
    for(const [id,f] of [['contactFields','contact'],['paymentProviders','payments'],['cardHandling','payments'],['shippingProviders','shipping'],['newsletterProvider','newsletter'],['chatProvider','chat'],['analyticsAds','analytics']])$(id+'Wrap').hidden=!has(f);
    $('retentionCustomWrap').hidden=d.retention!=='custom';
    $('cookieUrlWrap').hidden=d.cookieMode!=='center';
    $('optoutUrlWrap').hidden=d.saleShare!=='yes';
    $('sharingDetailsWrap').hidden=d.saleShare!=='yes';
    $('transferDetailsWrap').hidden=d.transfers!=='yes';
    $('usFields').hidden=d.jurisdiction==='MX';
  }
  function showErrors(issues){
    document.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));
    $('errors').hidden=!issues.length;
    $('errors').innerHTML=issues.length?'<strong>Falta revisar:</strong><ul>'+issues.map(x=>`<li>${engine.escape(x.message)}</li>`).join('')+'</ul>':'';
    issues.forEach(x=>$(x.field)?.setAttribute('aria-invalid','true'));
    if(issues.length){const el=$(issues[0].field)||$('contactFieldsWrap').querySelector('input');el?.closest('details')?.setAttribute('open','');el?.focus();}
  }
  function screen(n){
    currentStep=n;
    document.querySelectorAll('.screen').forEach(el=>el.classList.toggle('active',+el.dataset.screen===n));
    document.querySelectorAll('.step').forEach(el=>{el.classList.toggle('active',+el.dataset.s===n);if(+el.dataset.s===n)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
    document.querySelector(`.screen[data-screen="${n}"] h2`).focus();
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function go(n){
    sync();
    const problems=n>currentStep?PolicyRules.issues(data()).filter(x=>x.step<n):[];
    if(problems.length){screen(problems[0].step);showErrors(problems);return;}
    showErrors([]);screen(n);if(n===4)generate();
  }
  function generate(){
    const d=data();result=engine.build(d);
    $('preview').innerHTML=engine.html(result.parts);
    $('preview').lang=d.language;
    $('plain').value=engine.plain(result.parts);
    $('contenthtml').value=engine.html(result.parts);
    $('fullhtml').value=engine.standalone(result.parts,d.language);
    $('summary').textContent=`${d.siteName} · ${d.jurisdiction} · ${d.language==='en'?'English':'Español'} · ${result.draft?'Borrador para revisión':'Datos confirmados'}`;
    const risks=PolicyRules.review(d);
    $('review').innerHTML='<strong>'+ (risks.length?'Revisión específica pendiente':'Antes de publicar')+'</strong><ul class="review-list">'+[...risks,'Publica el aviso y enlázalo al pie del sitio y junto a formularios o checkout.','Comprueba que los controles de cookies, consentimiento y solicitudes funcionan como se describen.','Verifica los textos libres en el idioma elegido y actualiza el aviso cuando cambien servicios o finalidades.'].map(s=>`<li>${engine.escape(s)}</li>`).join('')+'</ul>';
  }
  document.querySelectorAll('[data-go]').forEach(el=>el.addEventListener('click',()=>go(+el.dataset.go)));
  document.querySelectorAll('[data-preset]').forEach(el=>el.addEventListener('click',()=>{
    document.querySelectorAll('[name="features"]').forEach(c=>c.checked=presets[el.dataset.preset].includes(c.value));
    document.querySelectorAll('[data-preset]').forEach(b=>b.setAttribute('aria-pressed',String(b===el)));
    $('presetStatus').textContent=`Perfil: ${el.textContent}. Confirma las casillas; Analytics, reCAPTCHA, cuentas y envíos son opcionales.`;
    $('confirmed').checked=false;sync();
  }));
  $('generator').addEventListener('submit',e=>{e.preventDefault();if(currentStep<4)go(currentStep+1);});
  $('generator').addEventListener('input',e=>{
    if(e.target.readOnly)return;
    if(e.target.id!=='confirmed')$('confirmed').checked=false;
    if(e.target.name==='features'){$('presetStatus').textContent='Selección personalizada.';document.querySelectorAll('[data-preset]').forEach(b=>b.setAttribute('aria-pressed','false'));}
    sync();if(currentStep===4)generate();
  });
  document.querySelectorAll('[data-tab]').forEach(el=>el.addEventListener('click',()=>{
    currentTab=el.dataset.tab;
    $('preview').classList.toggle('hidden',currentTab!=='preview');
    ['plain','contenthtml','fullhtml'].forEach(id=>$(id).classList.toggle('active',id===currentTab));
    document.querySelectorAll('[data-tab]').forEach(b=>{b.classList.toggle('active',b===el);b.setAttribute('aria-pressed',String(b===el));});
  }));
  function ready(){const problems=PolicyRules.issues(data());if(problems.length){screen(problems[0].step);showErrors(problems);return false;}generate();return true;}
  $('copy').addEventListener('click',async()=>{
    if(!ready())return;
    const text=currentTab==='preview'?$('plain').value:$(currentTab).value;
    try{await navigator.clipboard.writeText(text);$('status').textContent='Documento copiado.';}
    catch{const target=$(currentTab==='preview'?'plain':currentTab);document.querySelector(`[data-tab="${target.id}"]`).click();target.focus();target.select();$('status').textContent='No se pudo acceder al portapapeles. El texto quedó seleccionado: usa Ctrl+C o ⌘C.';}
  });
  function download(format){
    if(!ready())return;
    const a=document.createElement('a'), html=format==='html';
    const url=URL.createObjectURL(new Blob([$(html?'fullhtml':'plain').value],{type:html?'text/html;charset=utf-8':'text/plain;charset=utf-8'}));
    a.href=url;a.download=`${result.draft?'borrador-':''}${data().language==='en'?'privacy-policy':'aviso-privacidad'}.${format}`;
    document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    $('status').textContent=result.draft?'Borrador descargado; conserva los pendientes hasta resolverlos.':'Documento descargado.';
  }
  $('downloadTxt').addEventListener('click',()=>download('txt'));
  $('downloadHtml').addEventListener('click',()=>download('html'));
  sync();
})();
