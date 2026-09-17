(function(root){
  const value = (d,k) => String(d[k] || '').trim();
  const has = (d,k) => (d.features || []).includes(k);
  const http = s => {try {const u=new URL(s);return ['http:','https:'].includes(u.protocol)&&!!u.hostname;}catch{return false;}};
  function issues(d) {
    const errors=[];
    const add=(field,message,step=3)=>errors.push({field,message,step});
    for(const [k,label] of [['siteName','nombre del sitio'],['responsible','nombre legal del responsable'],['address','domicilio completo'],['state','estado o entidad']]) if(!value(d,k)) add(k,`Completa el ${label}.`,1);
    if(!http(value(d,'siteUrl'))) add('siteUrl','Escribe una URL completa (https://ejemplo.com).',1);
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value(d,'email'))) add('email','Escribe un correo de privacidad válido.');
    for(const k of ['contactUrl',...(d.cookieMode==='center'?['cookieUrl']:[]),...(d.saleShare==='yes'?['optoutUrl']:[])]) if(value(d,k)&&!http(value(d,k))) add(k,'Usa una URL válida con http:// o https://.');
    if(has(d,'contact')&&!(d.contactFields||[]).length) add('contactFields','Selecciona los datos de tu formulario.',2);
    for(const [f,k,label] of [['payments','paymentProviders','pasarelas de pago'],['shipping','shippingProviders','paqueterías'],['newsletter','newsletterProvider','proveedor de newsletter'],['chat','chatProvider','proveedor de chat']]) if(has(d,f)&&!value(d,k))add(k,`Indica ${label}.`,2);
    if(has(d,'payments')&&!value(d,'cardHandling')) add('cardHandling','Indica quién recibe los datos de tarjeta.',2);
    if(!value(d,'hosting'))add('hosting','Indica tu proveedor de hosting.',2);
    if(value(d,'otherData')&&!value(d,'otherPurpose'))add('otherPurpose','Explica para qué usas los datos adicionales.',2);
    if(value(d,'otherProviders')&&!value(d,'otherProviderPurpose'))add('otherProviderPurpose','Indica qué datos reciben los otros proveedores y para qué.',2);
    if(d.retention==='custom'&&!value(d,'retentionCustom'))add('retentionCustom','Describe los plazos o criterios de conservación.');
    if(!value(d,'security'))add('security','Describe las medidas de seguridad que realmente aplicas.');
    if(d.cookieMode==='center'&&!value(d,'cookieUrl'))add('cookieUrl','Agrega el enlace al centro de preferencias.');
    if((has(d,'meta')||has(d,'ads')||(has(d,'analytics')&&d.analyticsAds==='yes'))&&d.saleShare==='no')add('saleShare','La publicidad seleccionada puede implicar compartición. Selecciona «Sí» o «No estoy seguro» y revisa la configuración.',2);
    if(d.saleShare==='yes'&&!value(d,'sharingDetails'))add('sharingDetails','Describe categorías de datos, destinatarios y finalidades de venta o compartición.',2);
    if(d.saleShare==='yes'&&!value(d,'optoutUrl'))add('optoutUrl','Agrega el enlace para rechazar venta, compartición o publicidad dirigida.');
    if(d.transfers==='yes'&&!value(d,'transferDetails'))add('transferDetails','Describe destinatarios, datos, países, finalidades y mecanismo de consentimiento o excepción.',2);
    return errors;
  }
  function review(d){
    const risks=[];
    if(d.sensitive==='yes') risks.push('Datos sensibles: se requiere un aviso y consentimiento específicos; esta plantilla no cubre ese tratamiento.');
    if(d.children==='yes') risks.push('Datos de menores: revisar consentimiento de representantes y COPPA en EE. UU.; la plantilla general es insuficiente.');
    if(d.gdpr==='yes')risks.push('Operación en Europa: se necesita una revisión adicional de GDPR y cookies.');
    if(d.jurisdiction!=='MX'&&d.usScope!=='no')risks.push('Confirma la aplicación de CCPA y otras leyes estatales. Hace falta un suplemento específico de categorías, destinatarios, retención, derechos y mecanismos por estado.');
    if(d.saleShare==='unknown')risks.push('Confirma si vendes, compartes datos o realizas publicidad dirigida antes de publicar.');
    if(d.saleShare==='yes')risks.push('Verifica el mecanismo de exclusión, las señales GPC y los avisos de venta/compartición aplicables.');
    if(d.transfers==='unknown')risks.push('Confirma las transferencias a terceros que actúan por cuenta propia.');
    if(d.transfers==='yes')risks.push('Revisa las transferencias declaradas y el consentimiento o excepción aplicable antes de publicar.');
    if(d.cardHandling==='direct'&&has(d,'payments'))risks.push('El tratamiento directo de tarjetas requiere revisar seguridad, contratos y obligaciones del sector de pagos.');
    if(d.cookieMode==='browser'&&(has(d,'analytics')||has(d,'meta')||has(d,'ads')||has(d,'maps')||has(d,'youtube')))risks.push('Revisa si necesitas consentimiento o exclusión efectivos: el navegador por sí solo puede no ser suficiente.');
    return risks;
  }
  const api={issues,review,http,has};
  if(typeof module!=='undefined')module.exports=api;else root.PolicyRules=api;
})(typeof window!=='undefined'?window:globalThis);
