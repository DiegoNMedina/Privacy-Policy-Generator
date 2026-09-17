(function(root){
  const {catalog}=typeof module!=='undefined'?require('./catalog.js'):root.PolicyCatalog;
  const rules=typeof module!=='undefined'?require('./rules.js'):root.PolicyRules;
  const escape = s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function build(d, now=new Date()){
    const es=d.language!=='en', t=(a,b)=>es?a:b, has=k=>rules.has(d,k), parts=[];
    const add=(a,b,p)=>parts.push({h:t(a,b),p:p.filter(Boolean)});
    const list=a=>a.filter(Boolean).join('; ');
    const risks=rules.review(d), incomplete=rules.issues(d).length>0;
    const draft=risks.length>0||incomplete||!d.confirmed;
    add(t(d.jurisdiction==='US'?'Política de privacidad':'Aviso de privacidad integral','Privacy policy'), 'Privacy policy',[
      draft?t('BORRADOR — requiere revisión antes de publicar.','DRAFT — review required before publication.'):null,
      t('Última actualización: ','Last updated: ')+now.toLocaleDateString(es?'es-MX':'en-US',{year:'numeric',month:'long',day:'numeric'}),
      t(`${d.responsible} es responsable del tratamiento de datos de ${d.siteName} (${d.siteUrl}).`,`${d.responsible} is responsible for processing personal information for ${d.siteName} (${d.siteUrl}).`)
    ]);
    add('Responsable y contacto','Business and privacy contact',[
      `${d.responsible}. ${d.address}. ${d.state}.`,
      t('Correo de privacidad: ','Privacy email: ')+d.email,
      d.phone?t('Teléfono: ','Phone: ')+d.phone:null,
      d.contactUrl?t('Solicitudes: ','Requests: ')+d.contactUrl:null
    ]);
    const fields={name:t('nombre','name'),email:t('correo electrónico','email address'),phone:t('teléfono','phone number'),message:t('mensaje','message'),company:t('empresa','company')};
    const data=[];
    if(d.logs==='yes')data.push(t('dirección IP, solicitudes, navegador, fecha y hora en registros técnicos del servidor','IP addresses, requests, browser, timestamps in technical server logs'));
    if(has('contact'))data.push((d.contactFields||[]).map(k=>fields[k]).filter(Boolean).join(', '));
    if(has('newsletter'))data.push(t('correo y preferencias de suscripción','email and subscription preferences'));
    if(has('chat'))data.push(t('datos de contacto y mensajes','contact information and messages'));
    if(has('woocommerce'))data.push(t('identificación, contacto, dirección de facturación, pedidos y devoluciones','identity, contact, billing address, orders and returns'));
    if(has('shipping'))data.push(t('nombre, dirección de entrega y teléfono del destinatario','recipient name, delivery address and phone'));
    if(has('payments'))data.push(t('referencias y estado de pago, importe y datos de transacción','payment references and status, amounts and transaction information'));
    if(has('payments')&&d.cardHandling==='direct')data.push(t('datos de tarjeta que recibimos directamente durante el pago','card information received directly during payment'));
    if(has('account'))data.push(t('registro, perfil y autenticación','registration, profile and authentication'));
    if(['analytics','recaptcha','meta','ads','cloudflare','maps','youtube'].some(has))data.push(t('señales técnicas del dispositivo y navegación, identificadores e interacciones según los servicios descritos abajo','technical device and browsing signals, identifiers and interactions through the services described below'));
    if(d.otherData)data.push(d.otherData);
    add('Datos y fuentes','Information and sources',[
      data.length?t('Tratamos las siguientes categorías: ','We process the following categories: ')+list(data)+'.':t('No recopilamos datos mediante formularios, cuentas ni registros técnicos según la configuración de este sitio. Si nos escribes al correo de privacidad, tratamos tu dirección y mensaje para atender la solicitud.','We do not collect information through forms, accounts or technical logs under this website’s configuration. If you email our privacy contact, we process your email address and message to handle your request.'),
      t('Recibimos información directamente de ti y, cuando se utilizan los servicios descritos, de tu navegador o dispositivo y de los proveedores que intervienen en la operación.','We receive information directly from you and, when the described services are used, from your browser or device and the providers involved in the operation.'),
      d.sensitive==='yes'?t('PENDIENTE: describir datos sensibles y su tratamiento específico.','PENDING: describe sensitive information and its specific processing.'):null
    ]);
    const essential=[t('operar el sitio, atender solicitudes de privacidad y cumplir obligaciones legales','operate the website, handle privacy requests and comply with legal obligations')];
    if(has('contact')||has('chat'))essential.push(t('responder mensajes y solicitudes de información o cotización','respond to messages and information or quote requests'));
    if(has('woocommerce')||has('payments'))essential.push(t('gestionar compras, pagos, facturación y devoluciones','manage purchases, payments, billing and refunds'));
    if(has('shipping'))essential.push(t('entregar pedidos','deliver orders'));
    if(has('account'))essential.push(t('administrar cuentas y accesos','manage accounts and sign-in'));
    if(has('recaptcha')||has('cloudflare')||d.logs==='yes')essential.push(t('prevenir fraude, abuso e incidentes de seguridad','prevent fraud, abuse and security incidents'));
    if(has('maps')||has('youtube'))essential.push(t('mostrar el contenido integrado solicitado','display requested embedded content'));
    const secondary=[];
    if(has('analytics'))secondary.push(t('medir visitas y mejorar el sitio','measure visits and improve the website'));
    if(has('newsletter'))secondary.push(t('enviar comunicaciones comerciales','send marketing communications'));
    if(has('meta')||has('ads')||(has('analytics')&&d.analyticsAds==='yes'))secondary.push(t('medir campañas y personalizar publicidad','measure campaigns and personalize advertising'));
    add('Finalidades','Purposes',[
      t('Finalidades necesarias: ','Necessary purposes: ')+list(essential)+'.',
      secondary.length?t('Finalidades secundarias: ','Secondary purposes: ')+list(secondary)+'.':null,
      secondary.length?t(`Puedes rechazar las finalidades secundarias desde el primer contacto escribiendo a ${d.email}, sin afectar el servicio principal. Para tecnologías automáticas, usa además los controles descritos en Cookies.`,`You may refuse secondary purposes from the first contact by emailing ${d.email}, without affecting the main service. For automated technologies, also use the controls described under Cookies.`):null,
      d.otherData?d.otherPurpose:null
    ]);
    add('Servicios y destinatarios','Services and recipients',[
      t(`Hosting e infraestructura: ${d.hosting}.`,`Hosting and infrastructure: ${d.hosting}.`),
      ...Object.keys(catalog).filter(has).map(k=>catalog[k][es?'es':'en']),
      has('payments')?t(`Pasarelas habilitadas: ${d.paymentProviders}.`,`Enabled payment providers: ${d.paymentProviders}.`):null,
      has('payments')&&d.cardHandling==='provider'?t('Los datos completos de tarjeta se introducen directamente en la pasarela; no los recibimos ni almacenamos.','Full card details are entered directly into the payment provider; we do not receive or store them.'):null,
      has('shipping')?t(`Paqueterías: ${d.shippingProviders}.`,`Carriers: ${d.shippingProviders}.`):null,
      has('newsletter')?t(`Proveedor de correo: ${d.newsletterProvider}.`,`Email provider: ${d.newsletterProvider}.`):null,
      has('chat')?t(`Mensajería: ${d.chatProvider}.`,`Messaging: ${d.chatProvider}.`):null,
      has('analytics')&&d.analyticsAds==='yes'?t('Las funciones publicitarias de Analytics están habilitadas e incluyen medición y audiencias para publicidad.','Analytics advertising features are enabled and include advertising measurement and audiences.'):null,
      d.otherProviders?`${d.otherProviders}: ${d.otherProviderPurpose}`:null
    ]);
    const cookies=[];
    if(['woocommerce','account','payments'].some(has))cookies.push(t('sesión y operaciones de compra','sessions and purchase operations'));
    if(has('recaptcha')||has('cloudflare'))cookies.push(t('seguridad','security'));
    if(has('analytics'))cookies.push(t('medición de uso','usage measurement'));
    if(has('meta')||has('ads')||(has('analytics')&&d.analyticsAds==='yes'))cookies.push(t('publicidad','advertising'));
    if(has('maps')||has('youtube'))cookies.push(t('contenido integrado','embedded content'));
    add('Cookies y controles','Cookies and controls',[
      cookies.length?t('Usamos cookies o tecnologías similares para: ','We use cookies or similar technologies for: ')+list(cookies)+'.':t('No utilizamos cookies de analítica o publicidad según los servicios descritos.','We do not use analytics or advertising cookies under the services described.'),
      d.cookieMode==='center'?t(`Puedes aceptar, rechazar o cambiar tus preferencias en ${d.cookieUrl}.`,`You can accept, reject or change your preferences at ${d.cookieUrl}.`):t('Puedes eliminar o bloquear cookies desde las preferencias de tu navegador. Esto puede afectar algunas funciones y no impide por sí solo todos los tratamientos de datos.','You can delete or block cookies in your browser settings. This may affect some functionality and does not by itself stop all processing.'),
      d.jurisdiction!=='MX'?t('No respondemos a la señal heredada Do Not Track del navegador. Esta señal es distinta de Global Privacy Control (GPC).','We do not respond to the legacy browser Do Not Track signal. This signal is distinct from Global Privacy Control (GPC).'):null,
      d.jurisdiction!=='MX'&&d.gpc==='yes'?t('Reconocemos las señales GPC como solicitudes de exclusión de venta, compartición o publicidad dirigida cuando lo exige la ley aplicable.','We recognize GPC signals as opt-out requests for sale, sharing or targeted advertising where required by applicable law.'):null,
      d.jurisdiction!=='MX'&&['analytics','meta','ads','youtube','maps'].some(has)?t('Los servicios integrados pueden recopilar información sobre tu actividad a lo largo del tiempo y en otros sitios conforme a su configuración y tus preferencias.','Integrated services may collect information about activity over time and across other sites according to their configuration and your preferences.'):null
    ]);
    add('Comunicación y transferencias','Disclosures and transfers',[
      t('Nuestros encargados reciben los datos necesarios para prestar los servicios contratados. También podemos comunicar información a autoridades cuando una obligación legal lo exija.','Our processors receive the information needed to provide contracted services. We may also disclose information to authorities when legally required.'),
      d.international==='yes'?t('Los proveedores pueden tratar información fuera de tu país bajo los contratos y medidas de protección aplicables.','Providers may process information outside your country under applicable agreements and safeguards.'):null,
      d.transfers==='yes'?d.transferDetails:d.transfers==='no'?t('Fuera de los destinatarios descritos, no realizamos transferencias a terceros para finalidades propias, salvo los supuestos legalmente permitidos.','Beyond the recipients described, we do not transfer information to third parties for their own purposes except where legally permitted.'):t('PENDIENTE: confirmar transferencias a terceros.','PENDING: confirm third-party transfers.'),
      d.saleShare==='yes'?d.sharingDetails:d.saleShare==='no'?t('No vendemos datos personales ni los compartimos para publicidad conductual entre contextos.','We do not sell personal information or share it for cross-context behavioral advertising.'):t('PENDIENTE: confirmar venta, compartición y publicidad dirigida.','PENDING: confirm sale, sharing and targeted advertising.'),
      d.saleShare==='yes'?t(`Puedes solicitar la exclusión en ${d.optoutUrl}.`,`You can request to opt out at ${d.optoutUrl}.`):null
    ]);
    const retention = [t('Conservamos los datos para atender solicitudes de privacidad durante su tramitación y los plazos de defensa de reclamaciones aplicables.', 'We retain privacy-request information while handling requests and for applicable legal-claim periods.')];
    if(has('contact')||has('chat'))retention.push(t('Las consultas se conservan mientras se atienden y durante los plazos necesarios para el seguimiento solicitado.', 'Inquiries are retained while being handled and as needed for requested follow-up.'));
    if(has('account'))retention.push(t('Los datos de cuenta se conservan mientras la cuenta esté activa.', 'Account information is retained while the account is active.'));
    if(has('woocommerce')||has('payments')||has('shipping'))retention.push(t('Los pedidos y transacciones se conservan durante la relación y los plazos fiscales, contractuales o de reclamaciones aplicables.', 'Orders and transactions are retained for the relationship and applicable tax, contractual or legal-claim periods.'));
    if(d.logs==='yes'||has('recaptcha')||has('cloudflare'))retention.push(t('Los registros técnicos se conservan durante el tiempo necesario para detectar y atender incidentes de seguridad.', 'Technical logs are retained as needed to detect and address security incidents.'));
    if(has('analytics')||has('meta')||has('ads'))retention.push(t('Los datos de medición y publicidad se conservan durante los periodos configurados necesarios para evaluar el uso y las campañas, y se eliminan o anonimizan al terminar su finalidad.', 'Measurement and advertising information is retained for configured periods needed to assess usage and campaigns, then deleted or anonymized when its purpose ends.'));
    if(has('newsletter'))retention.push(t('Los datos de suscripción se conservan hasta la baja; puede mantenerse una referencia mínima para respetar esa preferencia.', 'Subscription information is kept until unsubscribe; a minimal suppression record may remain to honor that choice.'));
    retention.push(t('Para las demás categorías, la conservación se limita a lo necesario para la finalidad informada y los plazos legales aplicables. Después eliminamos o anonimizamos los datos.', 'For other categories, retention is limited to what is needed for the disclosed purpose and applicable legal periods. We then delete or anonymize information.'));
    add('Conservación y seguridad','Retention and security',[
      d.retention==='custom'?d.retentionCustom:d.retention==='24m'?t('Conservamos consultas hasta 24 meses después del último contacto. Los documentos de operaciones se conservan durante los plazos fiscales, contractuales o de defensa de reclamaciones aplicables.','We retain inquiries for up to 24 months after the last contact. Transaction records are retained for applicable tax, contractual or legal-claim periods.'):retention.join(' '),
      t('Medidas aplicadas: ','Safeguards used: ')+d.security,
      t('Ningún sistema puede garantizar seguridad absoluta.','No system can guarantee absolute security.')
    ]);
    if(d.jurisdiction!=='US')add('México: derechos ARCO','Mexico: ARCO rights',[
      t(`Conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares puedes solicitar acceso, rectificación, cancelación u oposición, revocar tu consentimiento o limitar uso y divulgación escribiendo a ${d.email}.`,`Under Mexico’s Federal Law on Protection of Personal Data Held by Private Parties, you may request access, rectification, cancellation or objection, revoke consent or limit use and disclosure by emailing ${d.email}.`),
      t('Indica tu nombre, medio de respuesta, derecho y datos involucrados. Acredita identidad o representación; para rectificación indica los cambios y documentos de soporte. Comunicaremos la determinación en un máximo de 20 días hábiles y, si procede, la haremos efectiva en los 15 días hábiles siguientes. Los plazos podrán ampliarse una vez por un periodo igual cuando exista justificación. El acceso podrá proporcionarse por medios electrónicos.','Include your name, reply channel, right and relevant information. Verify identity or representation; for corrections, specify changes and supporting documents. We communicate our decision within 20 business days and, if granted, implement it within the following 15 business days. Each period may be extended once for an equal period when justified. Access may be provided electronically.'),
      t('La revocación no es retroactiva y puede estar limitada por obligaciones legales. Si no estás conforme, puedes acudir a la Secretaría Anticorrupción y Buen Gobierno mediante el procedimiento legal de protección de derechos.','Revocation is not retroactive and may be limited by legal obligations. If dissatisfied, you may seek protection of your rights through the legal procedure before Mexico’s Secretaría Anticorrupción y Buen Gobierno.')
    ]);
    if(d.jurisdiction!=='MX')add('Estados Unidos: solicitudes de privacidad','United States: privacy requests',[
      t(`Puedes solicitar consultar, corregir o eliminar tu información mediante ${d.email}${d.contactUrl?' o '+d.contactUrl:''}. Los derechos legales de acceso, eliminación, corrección, portabilidad y exclusión dependen de tu estado y de la aplicación de su ley al negocio.`,`You can request to review, correct or delete your information through ${d.email}${d.contactUrl?' or '+d.contactUrl:''}. Statutory access, deletion, correction, portability and opt-out rights depend on your state and whether its law applies to the business.`),
      t('Verificamos identidad o representación cuando corresponde, sin exigir verificación para exclusiones que legalmente no la requieren. No discriminamos por ejercer derechos aplicables. Si una ley aplicable permite apelar una negativa, puedes responder al contacto de privacidad solicitando una apelación; la respuesta indicará las vías adicionales ante la autoridad competente.','We verify identity or representation where appropriate, without requiring verification for opt-outs that legally do not require it. We do not discriminate for exercising applicable rights. If applicable law allows an appeal of a denial, you may contact our privacy contact to request an appeal; the response will identify further avenues with the competent authority.'),
      d.usScope!=='no'?t('PENDIENTE: completar el suplemento de leyes estatales aplicables antes de publicar.','PENDING: complete the applicable state-law supplement before publication.'):null
    ]);
    add('Menores de edad','Children',[
      d.children==='yes'?t('PENDIENTE: aviso específico para menores, edades y consentimiento de representantes.','PENDING: child-specific notice, ages and parental consent.'):t('El sitio no está dirigido a menores y no recopilamos conscientemente sus datos. Si crees que recibimos datos de un menor, contacta al correo de privacidad para solicitar su revisión y eliminación cuando corresponda.','The website is not directed to children and we do not knowingly collect their information. If you believe we received a child’s information, contact our privacy email to request review and deletion where appropriate.')
    ]);
    if(d.gdpr==='yes')add('Revisión para Europa','European review',[t('PENDIENTE: completar bases jurídicas, derechos, transferencias y representantes aplicables.','PENDING: complete applicable legal bases, rights, transfers and representatives.')]);
    add('Cambios y solicitudes','Changes and requests',[
      t('Publicaremos los cambios en esta página actualizando la fecha. Cuando sea obligatorio, comunicaremos cambios relevantes y obtendremos el consentimiento que corresponda antes del nuevo tratamiento.','We will publish changes on this page and update the date. Where required, we will communicate material changes and obtain applicable consent before new processing.'),
      d.rightsMethod||t(`Para consultas o solicitudes, escribe a ${d.email}.`,`For questions or requests, email ${d.email}.`)
    ]);
    parts.forEach((p,i)=>{if(i)p.h=`${i}. ${p.h}`;});
    return {parts,draft};
  }
  function html(parts){return parts.map((s,i)=>`<${i?'h2':'h1'}>${escape(s.h)}</${i?'h2':'h1'}>\n${s.p.map(p=>`<p>${escape(p)}</p>`).join('\n')}`).join('\n');}
  const plain=parts=>parts.map(s=>s.h+'\n\n'+s.p.join('\n\n')).join('\n\n');
  const standalone=(parts,lang)=>`<!DOCTYPE html>\n<html lang="${lang==='en'?'en':'es'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${lang==='en'?'Privacy policy':'Política de privacidad'}</title><style>body{font:16px/1.7 system-ui,sans-serif;max-width:900px;margin:40px auto;padding:0 24px;overflow-wrap:anywhere}h2{font-size:1.3em;margin-top:2em}</style></head><body>${html(parts)}</body></html>`;
  const api={build,html,plain,standalone,escape};
  if(typeof module!=='undefined')module.exports=api;else root.PolicyEngine=api;
})(typeof window!=='undefined'?window:globalThis);
