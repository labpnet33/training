var e=(e,t,n,r,i,a,o)=>`<rect x="`+e+`" y="`+t+`" width="`+n+`" height="`+r+`" rx="8" fill="`+i+`"/><text x="`+(e+n/2)+`" y="`+(t+r/2+(o?-2:4))+`" text-anchor="middle" class="svg-ink" font-size="12">`+a+`</text>`+(o?`<text x="`+(e+n/2)+`" y="`+(t+r/2+13)+`" text-anchor="middle" class="svg-muted" font-size="11">`+o+`</text>`:``),t=(e,t,n,r)=>`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="#64748b" stroke-width="2"/>`,n=(e,t,n)=>`<div class="dia"><svg viewBox="0 0 640 `+e+`" role="img" aria-label="diagram">`+t+`</svg><p class="cap">`+n+`</p></div>`,r=r=>n(230,e(10,15,150,44,`#bae6fd`,r.a1)+e(10,70,150,44,`#bbf7d0`,r.a2)+e(10,125,150,44,`#ddd6fe`,r.a3)+e(10,180,150,44,`#fde68a`,r.a4)+e(250,15,380,44,`#e2e8f0`,r.m1)+e(250,70,380,44,`#e2e8f0`,r.m2)+e(250,125,380,44,`#e2e8f0`,r.m3)+e(250,180,380,44,`#e2e8f0`,r.m4)+t(160,37,250,37)+t(160,92,250,92)+t(160,147,250,147)+t(160,202,250,202),r.cap),i={id:`exam-careers-summary`,h:{en:`The Architect exam, the study map, careers, and summary checklist`,hi:`Architect exam, study map, careers aur summary checklist`},body:{en:`
<p>This last chapter turns the module into a plan: what the <b>FCSS SD-WAN 7.6 Architect</b> exam covers, how the modules of this track map onto it, what jobs the skill opens, and a checklist and glossary to confirm you are ready for the next module.</p>
<h3>The exam in brief</h3>
<p>The exam is <b>FCSS_SDW_AR-7.6</b>, part of the Fortinet Certified Solution Specialist (FCSS) level, which sits above the professional level (FCP, formerly NSE 4) that this track assumes. It is a multiple-choice exam of roughly 38 questions in about 75 minutes; confirm the current numbers in Fortinet's official exam description before you book, because they can change. It tests five areas:</p>
`+r({a1:`Basic SD-WAN setup`,a2:`Rules and routing`,a3:`Centralised management`,a4:`Advanced IPsec + troubleshooting`,m1:`nse4-sdwan, fsd-sla: members, zones, health checks, SLAs`,m2:`fsd-rules, fsd-routing: strategies, ISDB, BGP and OSPF over overlay`,m3:`fsd-fmg: FortiManager templates, CLI templates, Overlay Orchestrator`,m4:`fsd-ipsec, fsd-advpn, fsd-shaping, fsd-cloud, fsd-ts`,cap:`How the exam areas map onto the modules of this track (troubleshooting is also threaded through every module).`})+`
<h3>How to study</h3>
<table class="cmp"><tr><th>Week</th><th>Focus</th><th>Outcome</th></tr>
<tr><td>1</td><td>This module, nse4-sdwan, nse4-routing</td><td>You can draw a branch with zone, members and a zone policy</td></tr>
<tr><td>2</td><td>fsd-sla and fsd-rules</td><td>You can choose a health check, an SLA and a strategy for voice, SaaS and bulk</td></tr>
<tr><td>3</td><td>fsd-routing and fsd-ipsec</td><td>You can explain BGP over overlay and hub-and-spoke IPsec</td></tr>
<tr><td>4</td><td>fsd-advpn, fsd-fmg</td><td>You can explain shortcuts and templates</td></tr>
<tr><td>5</td><td>fsd-shaping, fsd-cloud, fsd-ts</td><td>You can walk a flow through the ladder</td></tr></table>
<h3>Careers</h3>
<ul><li><b>SD-WAN or network security engineer:</b> builds and runs branch and hub estates for enterprises and managed-service providers.</li><li><b>Solutions or pre-sales architect:</b> sizes hubs, chooses the design shape, writes the business case.</li><li><b>NOC and operations engineer:</b> monitors SLAs, reads logs, handles tickets with the troubleshooting ladder.</li><li><b>Managed security service provider (MSSP) engineer:</b> operates hundreds of branches with FortiManager templates.</li><li><b>Next steps:</b> FCSS in related areas and, later, the expert level; pair SD-WAN with cloud, security operations and automation skills.</li></ul>
<h3>Can-do checklist</h3>
<ul><li>Explain three problems of the classic WAN and how SD-WAN addresses each.</li><li>Define underlay, overlay, hub, spoke, member, zone, health check, SLA, rule, implicit rule, ISDB, ADVPN, shortcut.</li><li>Choose single hub, dual hub or multi-region from a requirement.</li><li>Describe the migration phases of a branch and what can fail in each.</li><li>Explain why Fortinet puts NGFW and SD-WAN in one FortiOS.</li><li>Recite the troubleshooting ladder and name a tool for each rung.</li><li>Map each exam area to the module that teaches it.</li></ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>FCSS</dt><dd>Fortinet Certified Solution Specialist, the level of the Architect exam.</dd><dt>Secure SD-WAN</dt><dd>SD-WAN built into FortiOS next to the NGFW.</dd><dt>DIA</dt><dd>Direct internet access (local breakout).</dd><dt>SLA</dt><dd>Thresholds that define a good link.</dd><dt>Hairpin</dt><dd>Traffic that goes to a hub only to come back to a nearby site.</dd></dl>
<h3>Most-tested facts</h3>
<ul><li>SD-WAN is a FortiOS feature configured in <code>config system sdwan</code>; no separate controller is needed on the unit.</li><li>Policies and the default route point at the zone, not the member.</li><li>The underlay is physical; the overlay is IPsec across it.</li><li>The five exam areas: basic setup, rules and routing, centralised management, advanced IPsec, troubleshooting.</li><li>Designs: single hub, dual hub, multi-region; add ADVPN for branch-to-branch and local breakout for SaaS.</li></ul>
<h3>Command cheat-sheet (reference)</h3>
<pre class="code">! Try it: lab "Two ISPs become one SD-WAN zone"
config system sdwan
diagnose sys sdwan member
diagnose sys sdwan health-check
diagnose sys sdwan service
diagnose firewall proute list
get router info routing-table all</pre>
<div class="warn"><p><b>Common mistake.</b> Studying only the CLI. The Architect exam rewards design reasoning: why this shape, why this strategy, why this template.</p></div>
<div class="exam"><p><b>Exam trap.</b> Time is short (about two minutes per question). Read the requirement first, eliminate answers that name the wrong object (member instead of zone, static instead of dynamic), then pick.</p></div>
<div class="scn"><h4>From NOC to architect</h4><p>A NOC engineer in Hyderabad used the troubleshooting ladder on every SD-WAN ticket for a year and kept notes of root causes. Her notes became the basis of the company's design standard, and she moved into an architect role with FCSS SD-WAN as the credential behind it.</p><p><b>Lesson:</b> Operate carefully, document patterns, and design from what breaks.</p></div>
<div class="iv"><p class="q">"Why did you pursue the SD-WAN Architect certification?"</p><p>A good answer ties the cert to a project: designing hub-and-spoke overlays, choosing SLAs and rules from business requirements, and managing a fleet with FortiManager. Show that you can explain both the design reason and the diagnostic command.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>FCSS_SDW_AR-7.6 has five areas; this track maps onto them one by one.</li><li>Study order: foundations, SLAs and rules, routing and IPsec, ADVPN and management, troubleshooting.</li><li>Careers: SD-WAN engineer, architect, NOC, MSSP engineer.</li><li>You are ready for the next modules when you can use the vocabulary and the ladder without notes.</li></ul></div>
`,hi:`
<p>Yeh aakhri chapter module ko ek plan mein badalta hai: <b>FCSS SD-WAN 7.6 Architect</b> exam kya cover karta hai, is track ke modules uspar kaise map hote hain, yeh skill kaun si jobs kholti hai, aur ek checklist aur glossary jo confirm kare ki aap agle module ke liye taiyaar ho.</p>
<h3>Exam ek nazar mein</h3>
<p>Exam <b>FCSS_SDW_AR-7.6</b> hai, jo Fortinet Certified Solution Specialist (FCSS) level ka hissa hai, jo professional level (FCP, pehle NSE 4) ke upar aata hai jise yeh track maanta hai. Yeh lagbhag 38 sawalon wala multiple-choice exam hai lagbhag 75 minute mein; book karne se pehle Fortinet ke official exam description mein current numbers confirm karo, kyunki woh badal sakte hain. Yeh paanch areas test karta hai:</p>
`+r({a1:`Basic SD-WAN setup`,a2:`Rules and routing`,a3:`Centralised management`,a4:`Advanced IPsec + troubleshooting`,m1:`nse4-sdwan, fsd-sla: members, zones, health checks, SLAs`,m2:`fsd-rules, fsd-routing: strategies, ISDB, overlay par BGP aur OSPF`,m3:`fsd-fmg: FortiManager templates, CLI templates, Overlay Orchestrator`,m4:`fsd-ipsec, fsd-advpn, fsd-shaping, fsd-cloud, fsd-ts`,cap:`Exam areas is track ke modules par kaise map hote hain (troubleshooting har module mein bhi piroya gaya hai).`})+`
<h3>Kaise padhein</h3>
<table class="cmp"><tr><th>Hafta</th><th>Focus</th><th>Result</th></tr>
<tr><td>1</td><td>Yeh module, nse4-sdwan, nse4-routing</td><td>Aap zone, members aur zone policy wali branch draw kar sakte ho</td></tr>
<tr><td>2</td><td>fsd-sla aur fsd-rules</td><td>Aap voice, SaaS aur bulk ke liye health check, SLA aur strategy chun sakte ho</td></tr>
<tr><td>3</td><td>fsd-routing aur fsd-ipsec</td><td>Aap overlay par BGP aur hub-and-spoke IPsec samjha sakte ho</td></tr>
<tr><td>4</td><td>fsd-advpn, fsd-fmg</td><td>Aap shortcuts aur templates samjha sakte ho</td></tr>
<tr><td>5</td><td>fsd-shaping, fsd-cloud, fsd-ts</td><td>Aap ek flow ko ladder se guzaar sakte ho</td></tr></table>
<h3>Careers</h3>
<ul><li><b>SD-WAN ya network security engineer:</b> enterprises aur managed-service providers ke liye branch aur hub estates banata aur chalata hai.</li><li><b>Solutions ya pre-sales architect:</b> hubs size karta hai, design shape chunta hai, business case likhta hai.</li><li><b>NOC aur operations engineer:</b> SLAs monitor karta hai, logs padhta hai, troubleshooting ladder se tickets handle karta hai.</li><li><b>Managed security service provider (MSSP) engineer:</b> FortiManager templates se saikdon branches operate karta hai.</li><li><b>Agle steps:</b> related areas mein FCSS aur baad mein expert level; SD-WAN ko cloud, security operations aur automation skills ke saath jodo.</li></ul>
<h3>Can-do checklist</h3>
<ul><li>Classic WAN ki teen problems batao aur SD-WAN har ek ko kaise address karta hai.</li><li>Underlay, overlay, hub, spoke, member, zone, health check, SLA, rule, implicit rule, ISDB, ADVPN, shortcut define karo.</li><li>Requirement se single hub, dual hub ya multi-region chuno.</li><li>Branch ke migration phases batao aur har mein kya fail ho sakta hai.</li><li>Samjhao ki Fortinet NGFW aur SD-WAN ek FortiOS mein kyun rakhta hai.</li><li>Troubleshooting ladder bolo aur har rung ke liye ek tool batao.</li><li>Har exam area ko us module se map karo jo use sikhata hai.</li></ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>FCSS</dt><dd>Fortinet Certified Solution Specialist, Architect exam ka level.</dd><dt>Secure SD-WAN</dt><dd>NGFW ke baju mein FortiOS mein built-in SD-WAN.</dd><dt>DIA</dt><dd>Direct internet access (local breakout).</dd><dt>SLA</dt><dd>Thresholds jo achhi link define karte hain.</dd><dt>Hairpin</dt><dd>Aisa traffic jo hub tak sirf paas ki site par wapas aane ke liye jaata hai.</dd></dl>
<h3>Sabse zyada tested facts</h3>
<ul><li>SD-WAN FortiOS feature hai jo <code>config system sdwan</code> mein configure hota hai; unit par alag controller nahi chahiye.</li><li>Policies aur default route zone ko point karte hain, member ko nahi.</li><li>Underlay physical hai; overlay uske upar IPsec hai.</li><li>Paanch exam areas: basic setup, rules and routing, centralised management, advanced IPsec, troubleshooting.</li><li>Designs: single hub, dual hub, multi-region; branch-to-branch ke liye ADVPN aur SaaS ke liye local breakout jodo.</li></ul>
<h3>Command cheat-sheet (reference)</h3>
<pre class="code">! Try it: lab "Do ISPs ek SD-WAN zone bante hain"
config system sdwan
diagnose sys sdwan member
diagnose sys sdwan health-check
diagnose sys sdwan service
diagnose firewall proute list
get router info routing-table all</pre>
<div class="warn"><p><b>Common galti.</b> Sirf CLI padhna. Architect exam design reasoning ko reward karta hai: yeh shape kyun, yeh strategy kyun, yeh template kyun.</p></div>
<div class="exam"><p><b>Exam trap.</b> Time kam hai (lagbhag do minute per question). Pehle requirement padho, galat object wale jawab hatao (zone ki jagah member, dynamic ki jagah static), phir chuno.</p></div>
<div class="scn"><h4>NOC se architect tak</h4><p>Hyderabad ki ek NOC engineer ne saal bhar har SD-WAN ticket par troubleshooting ladder use ki aur root causes ke notes rakhe. Uske notes company ke design standard ka aadhar bane, aur woh FCSS SD-WAN credential ke saath architect role mein aa gayi.</p><p><b>Seekh:</b> Dhyaan se operate karo, patterns document karo, aur jo toot-ta hai usse design karo.</p></div>
<div class="iv"><p class="q">"Aapne SD-WAN Architect certification kyun ki?"</p><p>Achha jawab cert ko project se jodta hai: hub-and-spoke overlays design karna, business requirements se SLAs aur rules chunna, aur FortiManager se fleet manage karna. Dikhao ki aap design ka reason aur diagnostic command dono samjha sakte ho.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>FCSS_SDW_AR-7.6 ke paanch areas hain; yeh track unse ek-ek map hota hai.</li><li>Study order: foundations, SLAs aur rules, routing aur IPsec, ADVPN aur management, troubleshooting.</li><li>Careers: SD-WAN engineer, architect, NOC, MSSP engineer.</li><li>Aap agle modules ke liye taiyaar ho jab vocabulary aur ladder bina notes ke use kar sako.</li></ul></div>
`}};export{i as default};