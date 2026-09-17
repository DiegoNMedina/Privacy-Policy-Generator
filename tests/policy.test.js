const {test}=require('node:test');
const assert=require('node:assert/strict');
const engine=require('../assets/js/policy.js');
const rules=require('../assets/js/rules.js');
const {catalog,presets}=require('../assets/js/catalog.js');
const base={siteName:'Demo',siteUrl:'https://example.com',responsible:'Demo LLC',address:'1 Example St, City, 00000, USA',state:'Texas',language:'es',jurisdiction:'MX',email:'privacy@example.com',hosting:'Example host',logs:'yes',security:'Access controls and TLS.',saleShare:'no',transfers:'no',features:[],contactFields:['email'],cookieMode:'browser',retention:'purpose',usScope:'no',confirmed:true};
const text=d=>engine.plain(engine.build({...base,...d},new Date('2026-09-17T12:00:00Z')).parts);
for(const language of ['es','en'])for(const jurisdiction of ['MX','US','BOTH'])for(const [preset,features] of Object.entries(presets))test(`${language}/${jurisdiction}/${preset}`,()=>{
 const d={...base,language,jurisdiction,features,paymentProviders:'Stripe',cardHandling:'provider'};
 assert.deepEqual(rules.issues(d),[]);
 const r=engine.build(d);const content=engine.plain(r.parts);
 assert.equal(r.draft,false);assert(!content.includes('undefined'));
 assert.equal(content.includes('ARCO'),jurisdiction!=='US');
 assert.equal(content.includes('Do Not Track'),jurisdiction!=='MX');
 assert.equal(content.includes('WooCommerce'),preset==='shop');
 assert(!content.includes('Google Analytics'));assert(!content.includes('Google reCAPTCHA'));
 assert(r.parts.slice(1).every((p,i)=>p.h.startsWith(`${i+1}. `)));
 assert(engine.standalone(r.parts,language).includes(`lang="${language}"`));
});
test('each service is included only when selected, in both languages',()=>{
 for(const language of ['es','en'])for(const [key,f] of Object.entries(catalog)){
  assert(text({language,features:[key]}).includes(f[language]));
  assert(!text({language}).includes(f[language]));
 }
});
test('informational site does not invent forms, store or account retention',()=>{
 const out=text({language:'en'});
 assert(!out.includes('Account information is retained'));
 assert(!out.includes('Orders and transactions are retained'));
 assert(!out.includes('Subscription information is kept'));
 assert(out.includes('technical server logs'));
});
test('form fields match the selection',()=>{
 const out=text({language:'en',features:['contact'],contactFields:['email']});
 assert(out.includes('following categories: IP addresses'));
 assert(!out.includes('phone number'));
 assert(rules.issues({...base,features:['contact'],contactFields:[]}).some(x=>x.field==='contactFields'));
});
test('advertising cannot silently claim no sharing',()=>{
 for(const features of [['meta'],['ads'],['analytics']]){
 assert(rules.issues({...base,features,analyticsAds:'yes'}).some(x=>x.field==='saleShare'));
 }
 assert(!rules.issues({...base,analyticsAds:'yes'}).some(x=>x.field==='saleShare'));
});
test('disabled service details do not leak or block navigation',()=>{
 assert(!text({paymentProviders:'OLD GATEWAY'}).includes('OLD GATEWAY'));
 assert(!rules.issues({...base,cookieUrl:'invalid',optoutUrl:'invalid'}).length);
 assert(!rules.review({...base,cardHandling:'direct'}).length);
});
test('complex scenarios remain drafts even after confirmation',()=>{
 for(const update of [{sensitive:'yes'},{children:'yes'},{gdpr:'yes'},{saleShare:'unknown'},{transfers:'unknown'},{jurisdiction:'US',usScope:'unknown'},{jurisdiction:'US',usScope:'yes'},{saleShare:'yes'}])assert(engine.build({...base,...update}).draft);
 assert(engine.build({...base,confirmed:false}).draft);
});
test('required details and URL validation',()=>{
 for(const field of ['responsible','address','siteName','siteUrl','email','hosting','security'])assert(rules.issues({...base,[field]:''}).some(x=>x.field===field));
 assert(!rules.http('javascript:alert(1)'));
 assert(rules.issues({...base,features:['payments']}).some(x=>x.field==='paymentProviders'));
 assert(rules.issues({...base,retention:'custom'}).some(x=>x.field==='retentionCustom'));
 assert(rules.issues({...base,cookieMode:'center'}).some(x=>x.field==='cookieUrl'));
});
test('export escapes user input; text stays literal',()=>{
 const d={...base,siteName:'<img src=x onerror=alert(1)>',security:'</p><script>alert(1)</script>'};
 const {parts}=engine.build(d);
 assert(!engine.html(parts).includes('<script>'));
 assert(engine.html(parts).includes('&lt;script&gt;'));
 assert(engine.plain(parts).includes('<script>'));
});
test('reCAPTCHA processor clause and ARCO current authority',()=>{
 const out=text({features:['recaptcha']});
 assert(out.includes('por cuenta del responsable'));
 assert(out.includes('20 días hábiles'));
 assert(out.includes('Secretaría Anticorrupción y Buen Gobierno'));
 assert(!out.includes('INAI'));
});
