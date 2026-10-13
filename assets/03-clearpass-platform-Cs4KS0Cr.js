var e={id:`clearpass-platform`,h:{en:`The ClearPass platform and how a request is decided`,hi:`ClearPass platform aur request ka decision kaise hota hai`},body:{en:`
<p>You know the two languages. Now open the box and look at ClearPass Policy Manager (CPPM) itself: what it is made of, where you configure it, and the fixed order in which it thinks about every single request. If you remember this order, almost every ClearPass problem becomes a short checklist.</p>

<h3>Analogy: a bank loan desk</h3>
<p>When you walk into a bank for a loan, the process is always the same. First the clerk checks you came to the right counter. Then the bank decides which loan scheme applies to you. Then it verifies your documents. Then it classifies you (salaried, business, student). Then it applies the scheme's terms. Finally it gives you a sanction letter. The bank never skips or reorders these steps. ClearPass is the same: an assembly line with fixed stations.</p>

<h3>What ClearPass is</h3>
<p><b>Aruba ClearPass Policy Manager</b> is a policy server delivered as a hardware appliance, a virtual appliance or a cloud instance. It is a RADIUS server, a TACACS+ server for device administration, a guest and onboarding platform, a posture and profiling engine, and a reporting tool. In this module you use only the first function: RADIUS authentication, authorization and enforcement for wired access.</p>
<p>Real ClearPass is configured in a <b>web GUI</b> with a tree on the left: Configuration, Monitoring, Administration. Under Configuration you find Services, Identity, Posture, Enforcement, Network (which holds Devices). The lab text shell mirrors that tree, so the command <code>configuration enforcement policy ...</code> equals Configuration, Enforcement, Policies. The GUI is a <b>concept that is not simulated in the lab</b>; you will learn the real menu path and then practise with the Lab shell command.</p>

<table class="cmp"><tr><th>GUI path</th><th>What lives there</th><th>Lab shell prefix</th></tr>
<tr><td>Configuration, Network, Devices</td><td>Network devices (NADs)</td><td>configuration network device</td></tr>
<tr><td>Configuration, Identity, Local Users / Endpoints / Roles / Role Mappings</td><td>Users, endpoints, roles</td><td>configuration identity ...</td></tr>
<tr><td>Configuration, Enforcement, Profiles / Policies</td><td>What to return</td><td>configuration enforcement ...</td></tr>
<tr><td>Configuration, Services</td><td>The assembly line</td><td>configuration service</td></tr>
<tr><td>Monitoring, Live Monitoring, Access Tracker / Event Viewer</td><td>Evidence</td><td>monitoring access-tracker, event-viewer</td></tr></table>

<h3>The six stations every request passes</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="ClearPass request pipeline">
<rect x="6" y="20" width="96" height="60" rx="8" fill="#bae6fd"/><text x="54" y="46" text-anchor="middle" class="svg-ink" font-size="12">1 NAD</text><text x="54" y="64" text-anchor="middle" class="svg-muted" font-size="11">known?</text>
<rect x="110" y="20" width="96" height="60" rx="8" fill="#bbf7d0"/><text x="158" y="46" text-anchor="middle" class="svg-ink" font-size="12">2 Service</text><text x="158" y="64" text-anchor="middle" class="svg-muted" font-size="11">classify</text>
<rect x="214" y="20" width="96" height="60" rx="8" fill="#ddd6fe"/><text x="262" y="46" text-anchor="middle" class="svg-ink" font-size="12">3 Authen</text><text x="262" y="64" text-anchor="middle" class="svg-muted" font-size="11">who?</text>
<rect x="318" y="20" width="96" height="60" rx="8" fill="#fde68a"/><text x="366" y="46" text-anchor="middle" class="svg-ink" font-size="12">4 Role map</text><text x="366" y="64" text-anchor="middle" class="svg-muted" font-size="11">which role?</text>
<rect x="422" y="20" width="96" height="60" rx="8" fill="#fed7aa"/><text x="470" y="46" text-anchor="middle" class="svg-ink" font-size="12">5 Enforce</text><text x="470" y="64" text-anchor="middle" class="svg-muted" font-size="11">which profile?</text>
<rect x="526" y="20" width="108" height="60" rx="8" fill="#e2e8f0"/><text x="580" y="46" text-anchor="middle" class="svg-ink" font-size="12">6 Response</text><text x="580" y="64" text-anchor="middle" class="svg-muted" font-size="11">attributes</text>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="13">Every request is also written to the Access Tracker (7 Monitoring)</text>
</svg><p class="cap">Fixed order. A failure at one station stops the later ones.</p></div>

<ol>
<li><b>Network device check.</b> The source IP of the RADIUS packet must match a configured network device, and the shared secret must match. Otherwise the packet is dropped silently and only the Event Viewer records it.</li>
<li><b>Service classification.</b> Services are tested top to bottom. The first service whose rules match wins. No match gives error <b>9002</b> "Failed to classify request to service".</li>
<li><b>Authentication.</b> The service names the authentication methods and sources. Wrong password raises alert 215, unknown user or endpoint 216, disabled account 217.</li>
<li><b>Authorization and role mapping.</b> A role-mapping policy converts attributes (for example Department) into ClearPass <b>roles</b>.</li>
<li><b>Enforcement.</b> An enforcement policy converts roles and other conditions into enforcement profiles. If no rule matches, the policy default profile is used, often the built-in deny.</li>
<li><b>Response.</b> The profile attributes go back in the Access-Accept (or the reject goes back), and the switch applies them.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> In the lab, alice authenticates on 1/1/3. Station 1: source 10.20.99.2 matches the device ACCESS. Station 2: the service Wired 802.1X matches NAS-Port-Type 15. Station 3: PEAP with the Local User Repository finds alice. Station 4: the first role-mapping match gives ENGINEER. Station 5: EPOL-WIRED chooses EP-EMPLOYEE. Station 6: Aruba-User-Role EMPLOYEE returns to the switch.</p></div>

<h3>Real-platform extras (concepts, not simulated in the lab)</h3>
<p>A production deployment is usually a <b>cluster</b>: one <b>Publisher</b> where you make configuration changes, and several <b>Subscribers</b> that receive the configuration and answer RADIUS requests close to the users. External sources such as Active Directory or LDAP are joined for user lookup, certificates are issued with Onboard, OnGuard checks device health, and profiling fingerprints devices. The lab models none of these; it uses a single server with a Local User Repository.</p>

<div class="warn"><p><b>Common mistakes.</b> Searching for the problem in the enforcement policy when the request never got past station 1 or 2. Editing configuration on a subscriber instead of the publisher. Forgetting that a service must be saved and enabled in its position in the list.</p></div>

<div class="exam"><p><b>Exam trap.</b> Role mapping and enforcement are different stations. A role-mapping policy outputs roles; an enforcement policy outputs enforcement profiles. A profile never creates a role, and a role does not by itself change a port.</p></div>

<div class="scn"><h4>Two engineers, one outage</h4><p>After a change window nobody could log in. Engineer A rewrote three enforcement policies for two hours. Engineer B opened the Access Tracker, saw error 9002 on every record, and found that the service rule had been edited by mistake. Ten minutes later everything worked, and A's policy edits turned out to be innocent.</p><p><b>Lesson:</b> follow the station order. Evidence from the Access Tracker tells you which station failed.</p></div>

<div class="iv"><p class="q">"Walk me through what ClearPass does when a RADIUS request arrives."</p><p>Strong answer: check the NAD by source IP and secret; classify to a service by ordered rules; authenticate against the service's methods and sources; run role mapping; run the enforcement policy; return the profile attributes; log everything in the Access Tracker. Mention that a failure early in the chain stops the later steps.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ClearPass is a policy server configured in a web GUI; the lab shell mirrors the menu path.</li>
<li>Order: NAD, service, authentication, role mapping, enforcement, response.</li>
<li>Services run top to bottom, first match wins; no match is error 9002.</li>
<li>Role mapping produces roles; enforcement produces profiles.</li>
<li>Clusters, AD, Onboard, OnGuard and profiling exist but are not simulated here.</li>
</ul></div>
`,hi:`
<p>Aap do languages jaan gaye. Ab ClearPass Policy Manager (CPPM) ka dabba kholo: woh kis cheez se bana hai, kahan configure hota hai, aur har ek request ke baare mein woh kis fixed order mein sochta hai. Agar yeh order yaad rakho, to lagbhag har ClearPass problem ek chhoti checklist ban jaati hai.</p>

<h3>Analogy: bank ka loan desk</h3>
<p>Bank mein loan ke liye jaate ho to process hamesha ek jaisa hota hai. Pehle clerk check karta hai ki aap sahi counter par aaye. Phir bank decide karta hai ki aap par kaunsi loan scheme lagti hai. Phir documents verify hote hain. Phir aapko classify kiya jaata hai (salaried, business, student). Phir scheme ki terms lagti hain. Aakhir mein sanction letter milta hai. Bank in steps ko kabhi skip ya reorder nahi karta. ClearPass bhi aisa hi hai: fixed stations wali assembly line.</p>

<h3>ClearPass kya hai</h3>
<p><b>Aruba ClearPass Policy Manager</b> ek policy server hai jo hardware appliance, virtual appliance ya cloud instance ke roop mein aata hai. Yeh RADIUS server hai, device administration ke liye TACACS+ server hai, guest aur onboarding platform hai, posture aur profiling engine hai, aur reporting tool hai. Is module mein aap sirf pehla function use karoge: wired access ke liye RADIUS authentication, authorization aur enforcement.</p>
<p>Real ClearPass ek <b>web GUI</b> mein configure hota hai jisme left side par tree hota hai: Configuration, Monitoring, Administration. Configuration ke neeche Services, Identity, Posture, Enforcement, Network (jisme Devices hain) milte hain. Lab ka text shell us tree ko mirror karta hai, isliye command <code>configuration enforcement policy ...</code> ka matlab Configuration, Enforcement, Policies hai. GUI ek <b>concept hai jo lab mein simulate nahi hota</b>; aap real menu path seekhoge aur phir Lab shell command se practice karoge.</p>

<table class="cmp"><tr><th>GUI path</th><th>Wahan kya hai</th><th>Lab shell prefix</th></tr>
<tr><td>Configuration, Network, Devices</td><td>Network devices (NADs)</td><td>configuration network device</td></tr>
<tr><td>Configuration, Identity, Local Users / Endpoints / Roles / Role Mappings</td><td>Users, endpoints, roles</td><td>configuration identity ...</td></tr>
<tr><td>Configuration, Enforcement, Profiles / Policies</td><td>Kya return karna hai</td><td>configuration enforcement ...</td></tr>
<tr><td>Configuration, Services</td><td>Assembly line</td><td>configuration service</td></tr>
<tr><td>Monitoring, Live Monitoring, Access Tracker / Event Viewer</td><td>Evidence</td><td>monitoring access-tracker, event-viewer</td></tr></table>

<h3>Chhe stations jinse har request guzarti hai</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="ClearPass request pipeline">
<rect x="6" y="20" width="96" height="60" rx="8" fill="#bae6fd"/><text x="54" y="46" text-anchor="middle" class="svg-ink" font-size="12">1 NAD</text><text x="54" y="64" text-anchor="middle" class="svg-muted" font-size="11">known?</text>
<rect x="110" y="20" width="96" height="60" rx="8" fill="#bbf7d0"/><text x="158" y="46" text-anchor="middle" class="svg-ink" font-size="12">2 Service</text><text x="158" y="64" text-anchor="middle" class="svg-muted" font-size="11">classify</text>
<rect x="214" y="20" width="96" height="60" rx="8" fill="#ddd6fe"/><text x="262" y="46" text-anchor="middle" class="svg-ink" font-size="12">3 Authen</text><text x="262" y="64" text-anchor="middle" class="svg-muted" font-size="11">kaun?</text>
<rect x="318" y="20" width="96" height="60" rx="8" fill="#fde68a"/><text x="366" y="46" text-anchor="middle" class="svg-ink" font-size="12">4 Role map</text><text x="366" y="64" text-anchor="middle" class="svg-muted" font-size="11">kaunsa role?</text>
<rect x="422" y="20" width="96" height="60" rx="8" fill="#fed7aa"/><text x="470" y="46" text-anchor="middle" class="svg-ink" font-size="12">5 Enforce</text><text x="470" y="64" text-anchor="middle" class="svg-muted" font-size="11">kaunsa profile?</text>
<rect x="526" y="20" width="108" height="60" rx="8" fill="#e2e8f0"/><text x="580" y="46" text-anchor="middle" class="svg-ink" font-size="12">6 Response</text><text x="580" y="64" text-anchor="middle" class="svg-muted" font-size="11">attributes</text>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="13">Har request Access Tracker mein bhi likhi jaati hai (7 Monitoring)</text>
</svg><p class="cap">Fixed order. Ek station par failure baad ke stations ko rok deta hai.</p></div>

<ol>
<li><b>Network device check.</b> RADIUS packet ka source IP kisi configured network device se match karna chahiye, aur shared secret bhi match karna chahiye. Warna packet chupchap drop ho jata hai aur sirf Event Viewer use record karta hai.</li>
<li><b>Service classification.</b> Services upar se neeche test hoti hain. Jis service ke rules pehle match karein woh jeet jaati hai. Koi match nahi to error <b>9002</b> "Failed to classify request to service".</li>
<li><b>Authentication.</b> Service authentication methods aur sources batati hai. Galat password alert 215, unknown user ya endpoint 216, disabled account 217 deta hai.</li>
<li><b>Authorization aur role mapping.</b> Role-mapping policy attributes (jaise Department) ko ClearPass <b>roles</b> mein badalti hai.</li>
<li><b>Enforcement.</b> Enforcement policy roles aur dusri conditions ko enforcement profiles mein badalti hai. Koi rule match na kare to policy ka default profile use hota hai, aksar built-in deny.</li>
<li><b>Response.</b> Profile attributes Access-Accept mein wapas jaate hain (ya reject wapas jaata hai), aur switch unhe apply karta hai.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Lab mein alice 1/1/3 par authenticate karti hai. Station 1: source 10.20.99.2 device ACCESS se match karta hai. Station 2: service Wired 802.1X NAS-Port-Type 15 se match karti hai. Station 3: Local User Repository ke saath PEAP alice ko dhoondhta hai. Station 4: pehla role-mapping match ENGINEER deta hai. Station 5: EPOL-WIRED EP-EMPLOYEE chunti hai. Station 6: Aruba-User-Role EMPLOYEE switch ko wapas jaata hai.</p></div>

<h3>Real-platform extras (concepts, lab mein simulate nahi hote)</h3>
<p>Production deployment aam taur par ek <b>cluster</b> hota hai: ek <b>Publisher</b> jahan aap configuration changes karte ho, aur kai <b>Subscribers</b> jo configuration lete hain aur users ke paas RADIUS requests ka jawab dete hain. User lookup ke liye Active Directory ya LDAP jaise external sources join kiye jaate hain, Onboard se certificates issue hote hain, OnGuard device health check karta hai, aur profiling devices ki fingerprint karta hai. Lab inme se kuch bhi model nahi karta; woh Local User Repository wala single server use karta hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Problem enforcement policy mein dhoondhna jab request station 1 ya 2 se aage gayi hi nahi. Publisher ke bajaye subscriber par configuration edit karna. Yeh bhoolna ki service save aur list mein sahi position par enabled honi chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> Role mapping aur enforcement alag stations hain. Role-mapping policy roles output karti hai; enforcement policy enforcement profiles output karti hai. Profile role nahi banata, aur role akela port ko nahi badalta.</p></div>

<div class="scn"><h4>Do engineers, ek outage</h4><p>Change window ke baad koi login nahi kar pa raha tha. Engineer A ne do ghante tak teen enforcement policies rewrite kin. Engineer B ne Access Tracker khola, har record par error 9002 dekha, aur paaya ki service rule galti se edit ho gaya tha. Das minute baad sab chal gaya, aur A ke policy edits nirdosh nikle.</p><p><b>Seekh:</b> station order follow karo. Access Tracker ka evidence batata hai ki kaunsa station fail hua.</p></div>

<div class="iv"><p class="q">"Jab RADIUS request aati hai to ClearPass kya karta hai, mujhe walk through karao."</p><p>Strong answer: source IP aur secret se NAD check; ordered rules se service classify; service ke methods aur sources se authenticate; role mapping chalao; enforcement policy chalao; profile attributes return karo; sab kuch Access Tracker mein log karo. Mention karo ki chain mein early failure baad ke steps ko rok deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ClearPass web GUI mein configure hone wala policy server hai; lab shell menu path mirror karta hai.</li>
<li>Order: NAD, service, authentication, role mapping, enforcement, response.</li>
<li>Services upar se neeche chalti hain, first match jeetta hai; no match error 9002 hai.</li>
<li>Role mapping roles deta hai; enforcement profiles deta hai.</li>
<li>Clusters, AD, Onboard, OnGuard aur profiling hain par yahan simulate nahi hote.</li>
</ul></div>
`}};export{e as default};