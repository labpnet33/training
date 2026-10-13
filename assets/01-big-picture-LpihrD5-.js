var e={id:`big-picture`,h:{en:`The decision chain: from RADIUS request to response`,hi:`Decision chain: RADIUS request se response tak`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn how ClearPass decides what a connecting user or device gets. You will build and read the five-stage chain: <b>service</b>, <b>authentication</b>, <b>role mapping</b>, <b>enforcement policy</b> and <b>enforcement profile</b>. You will see why order matters in three different places, and you will fix three realistic tickets: a contractor who is rejected, a test service that steals every login, and a catch-all rule that sends everybody to the guest role.</p>
<p><b>Prerequisites.</b> The earlier modules of this track: you should know what a network device (NAD) is, why the RADIUS shared secret must match, and you should have built one working service for Alice. We do not repeat that here. Guest access, reject and critical roles, CoA and deployment come in later modules.</p>

<h3>Start with an analogy: the reception desk of a large office</h3>
<p>Imagine a big office building. A visitor walks in and the reception desk runs a fixed routine. First the receptionist asks <i>what kind of visit is this?</i> (a staff member, a contractor, a courier) and picks the right counter. That is a <b>service</b>. At that counter the receptionist checks the ID card: that is <b>authentication</b>. Next the receptionist looks at the staff list and writes a category on the visitor sheet: "engineering staff" or "contractor". That is <b>role mapping</b>. Then the receptionist opens the security rulebook, which says "engineering staff get floors 2 to 5, contractors get floor 1 only, anybody not listed is turned away". That is the <b>enforcement policy</b>. Finally the guard programs an access card with the chosen floors, and that card is the <b>enforcement profile</b> handed back to the door system (the switch).</p>
<p>Every stage uses only what the earlier stage produced. If the receptionist picks the wrong counter, nothing later can be right. If two rules in the rulebook both fit, the one written higher up wins.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="ClearPass decision chain">
<rect x="8" y="50" width="108" height="56" rx="8" fill="#bae6fd"/><text x="62" y="75" text-anchor="middle" class="svg-ink" font-size="13">1 Service</text><text x="62" y="93" text-anchor="middle" class="svg-muted" font-size="11">classify</text>
<rect x="132" y="50" width="108" height="56" rx="8" fill="#bbf7d0"/><text x="186" y="75" text-anchor="middle" class="svg-ink" font-size="13">2 Authenticate</text><text x="186" y="93" text-anchor="middle" class="svg-muted" font-size="11">method + source</text>
<rect x="256" y="50" width="108" height="56" rx="8" fill="#ddd6fe"/><text x="310" y="75" text-anchor="middle" class="svg-ink" font-size="13">3 Role mapping</text><text x="310" y="93" text-anchor="middle" class="svg-muted" font-size="11">attributes to roles</text>
<rect x="380" y="50" width="108" height="56" rx="8" fill="#fde68a"/><text x="434" y="75" text-anchor="middle" class="svg-ink" font-size="13">4 Policy</text><text x="434" y="93" text-anchor="middle" class="svg-muted" font-size="11">roles to profile</text>
<rect x="504" y="50" width="128" height="56" rx="8" fill="#fed7aa"/><text x="568" y="75" text-anchor="middle" class="svg-ink" font-size="13">5 Profile</text><text x="568" y="93" text-anchor="middle" class="svg-muted" font-size="11">RADIUS attributes</text>
<g stroke="#64748b" stroke-width="2"><line x1="116" y1="78" x2="132" y2="78"/><line x1="240" y1="78" x2="256" y2="78"/><line x1="364" y1="78" x2="380" y2="78"/><line x1="488" y1="78" x2="504" y2="78"/></g>
<text x="320" y="24" text-anchor="middle" class="svg-accent" font-size="13">Request in: Access-Request from the switch</text>
<text x="320" y="146" text-anchor="middle" class="svg-accent" font-size="13">Response out: Access-Accept with Aruba-User-Role, or Access-Reject</text>
</svg><p class="cap">Five stages, always in this order. A failure at one stage is reported with its own alert in the Access Tracker.</p></div>

<h3>Where this chain sits in the product</h3>
<p>The real ClearPass Policy Manager is configured in its web GUI. The menus you will use are <b>Configuration &gt; Services</b>, <b>Configuration &gt; Identity &gt; Roles</b> and <b>Role Mappings</b>, <b>Configuration &gt; Enforcement &gt; Profiles</b> and <b>Policies</b>, and for checking results <b>Monitoring &gt; Live Monitoring &gt; Access Tracker</b>. The Config learning lab does not contain the GUI. It offers a text shell whose commands mirror the same menu path. In this course every step shows the real GUI path first and then the matching <b>Lab shell</b> command. The lab models are original learning models, not HPE Aruba software, but the order of decisions and the error codes follow the real product.</p>

<h3>The big idea: indirection</h3>
<p>Why not simply say "alice gets VLAN 10"? Because it does not scale. A company has thousands of users, many directories and many switch types. ClearPass puts two layers of labels between the person and the switch setting. Attributes (such as Department) become <b>roles</b> inside ClearPass. Roles become <b>enforcement profiles</b>. Profiles name a <b>switch role</b> or a VLAN. When Facilities hires fifty contractors you add no rules at all: they already carry the attribute, the attribute already maps to a role, and the role already has a profile. When the contractor VLAN changes you edit one profile.</p>

<div class="eg"><p><b>Worked example.</b> Our lab site has two laptops. Alice (Department Engineering) and Bob (Department Contractor) both connect to port 1/1/3 and 1/1/4 of the switch ACCESS. Alice: service Wired 802.1X matches, PEAP password is correct, role mapping RM-WIRED turns Department=Engineering into role ENGINEER, policy EPOL-WIRED sends ENGINEER to EP-EMPLOYEE, the profile returns Aruba-User-Role EMPLOYEE and the switch puts her in VLAN 10. Bob follows the same path, but at stage 3 RM-WIRED has no rule for Contractor, so he carries only the built-in role [User Authenticated]. At stage 4 no rule matches and the default profile [Deny Access Profile] applies. Bob is rejected even though his password is correct. Authentication is not authorization.</p></div>

<h3>What the evidence looks like</h3>
<p>Every request leaves one record in the Access Tracker. The Summary tab names each stage that ran. Learn to read it like a flight recorder.</p>
<pre class="out">Summary
-------
  Request ID                : R00000101-01-3f2a9c1e
  Login Status              : <span class="hl">REJECT</span>
  Username                  : bob
  Access Device Name        : ACCESS
  Service                   : Wired 802.1X
  Authentication Method     : [EAP PEAP],[EAP MSCHAPv2]
  Authentication Source     : [Local User Repository]
  Roles                     : <span class="hl">[User Authenticated]</span>
  Enforcement Profiles      : [Deny Access Profile]
  Enforcement Policy        : EPOL-WIRED</pre>
<p>Lab output, representative of the layout. Read it top to bottom: the service ran, authentication passed, only one role was assigned, so policy fell to the default deny. The fault is in role mapping or policy, not in the password.</p>

<div class="warn"><p><b>Common mistakes.</b> Debugging the password when the alert says no rule matched. Editing the switch when the problem is in ClearPass, or the reverse. Assuming that adding a rule is enough: the user keeps the old result until the session authenticates again.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Authentication succeeded, so access is granted" is wrong. Access is granted only when enforcement selects an Accept profile. A correct password with no matching enforcement rule and a deny default ends in Access-Reject.</p></div>

<div class="scn"><h4>The contractor who "has the right password"</h4><p>Monday, a contractor reports that the badge-in to the wired network fails although the password is fine. The helpdesk reset the password twice. An engineer opened the Access Tracker and saw ACCEPT at authentication but a final REJECT with the default deny profile. The Roles line showed only [User Authenticated]. The role mapping had never been told about contractors. A single rule in the role mapping and a matching policy rule fixed it in ten minutes.</p><p><b>Lesson:</b> read the stage where the chain stopped before touching anything.</p></div>

<div class="iv"><p class="q">"Walk me through what ClearPass does when a wired 802.1X request arrives."</p><p>Strong answer: identify the NAD by source IP and secret, classify the request to the first matching service, authenticate with the service methods against its sources, run role mapping to produce roles, evaluate the enforcement policy in order with a default profile, and return the profile attributes such as Aruba-User-Role. Mention that the Access Tracker shows every stage and that enforcement is evaluated only at authentication time.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The chain is service, authentication, role mapping, enforcement policy, enforcement profile.</li>
<li>Each stage uses the output of the previous one, so a wrong early stage poisons the rest.</li>
<li>Attributes become ClearPass roles; roles become profiles; profiles carry switch settings.</li>
<li>The GUI path is Configuration; the Lab shell mirrors it with text commands.</li>
<li>Authentication success does not mean access: enforcement decides.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki ClearPass kaise tay karta hai ki connect hone wale user ya device ko kya milega. Aap paanch stage ki chain banaoge aur padhoge: <b>service</b>, <b>authentication</b>, <b>role mapping</b>, <b>enforcement policy</b> aur <b>enforcement profile</b>. Aap dekhoge ki order teen alag jagah kyun matter karta hai, aur teen realistic tickets fix karoge: ek contractor jo reject ho raha hai, ek test service jo har login chura leti hai, aur ek catch-all rule jo sabko guest role bhej deta hai.</p>
<p><b>Prerequisites.</b> Is track ke pichhle modules: aapko pata hona chahiye ki network device (NAD) kya hota hai, RADIUS shared secret match kyun karna padta hai, aur Alice ke liye ek working service aap bana chuke ho. Wo yahan dobara nahi padhaenge. Guest access, reject aur critical roles, CoA aur deployment aage ke modules mein aayenge.</p>

<h3>Ek analogy se shuru karo: bade office ka reception desk</h3>
<p>Ek bada office building socho. Visitor andar aata hai aur reception desk ek fixed routine chalata hai. Pehle receptionist poochta hai <i>yeh kis tarah ki visit hai?</i> (staff, contractor, courier) aur sahi counter chunta hai. Yahi <b>service</b> hai. Us counter par receptionist ID card check karta hai: yeh <b>authentication</b> hai. Phir receptionist staff list dekhta hai aur visitor sheet par category likhta hai: "engineering staff" ya "contractor". Yeh <b>role mapping</b> hai. Uske baad security rulebook khulti hai: "engineering staff ko floor 2 se 5, contractors ko sirf floor 1, jo list mein nahi unhe wapas bhej do". Yeh <b>enforcement policy</b> hai. Aakhir mein guard ek access card program karta hai jismein chune hue floors hote hain, aur woh card <b>enforcement profile</b> hai jo door system (switch) ko wapas diya jaata hai.</p>
<p>Har stage sirf wahi use karta hai jo pichhle stage ne diya. Agar receptionist galat counter chun le, to aage kuch sahi nahi ho sakta. Agar rulebook ke do rule fit hote hain, to jo upar likha hai woh jeetta hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="ClearPass decision chain">
<rect x="8" y="50" width="108" height="56" rx="8" fill="#bae6fd"/><text x="62" y="75" text-anchor="middle" class="svg-ink" font-size="13">1 Service</text><text x="62" y="93" text-anchor="middle" class="svg-muted" font-size="11">classify</text>
<rect x="132" y="50" width="108" height="56" rx="8" fill="#bbf7d0"/><text x="186" y="75" text-anchor="middle" class="svg-ink" font-size="13">2 Authenticate</text><text x="186" y="93" text-anchor="middle" class="svg-muted" font-size="11">method + source</text>
<rect x="256" y="50" width="108" height="56" rx="8" fill="#ddd6fe"/><text x="310" y="75" text-anchor="middle" class="svg-ink" font-size="13">3 Role mapping</text><text x="310" y="93" text-anchor="middle" class="svg-muted" font-size="11">attribute se role</text>
<rect x="380" y="50" width="108" height="56" rx="8" fill="#fde68a"/><text x="434" y="75" text-anchor="middle" class="svg-ink" font-size="13">4 Policy</text><text x="434" y="93" text-anchor="middle" class="svg-muted" font-size="11">role se profile</text>
<rect x="504" y="50" width="128" height="56" rx="8" fill="#fed7aa"/><text x="568" y="75" text-anchor="middle" class="svg-ink" font-size="13">5 Profile</text><text x="568" y="93" text-anchor="middle" class="svg-muted" font-size="11">RADIUS attributes</text>
<g stroke="#64748b" stroke-width="2"><line x1="116" y1="78" x2="132" y2="78"/><line x1="240" y1="78" x2="256" y2="78"/><line x1="364" y1="78" x2="380" y2="78"/><line x1="488" y1="78" x2="504" y2="78"/></g>
<text x="320" y="24" text-anchor="middle" class="svg-accent" font-size="13">Request andar: switch se Access-Request</text>
<text x="320" y="146" text-anchor="middle" class="svg-accent" font-size="13">Response bahar: Aruba-User-Role ke saath Access-Accept, ya Access-Reject</text>
</svg><p class="cap">Paanch stage, hamesha isi order mein. Kisi stage par failure ka Access Tracker mein apna alert aata hai.</p></div>

<h3>Product mein yeh chain kahan baithti hai</h3>
<p>Asli ClearPass Policy Manager apne web GUI se configure hota hai. Jo menus aap use karoge: <b>Configuration &gt; Services</b>, <b>Configuration &gt; Identity &gt; Roles</b> aur <b>Role Mappings</b>, <b>Configuration &gt; Enforcement &gt; Profiles</b> aur <b>Policies</b>, aur result check karne ke liye <b>Monitoring &gt; Live Monitoring &gt; Access Tracker</b>. Config learning lab mein GUI nahi hai. Usmein ek text shell hai jiske commands wahi menu path mirror karte hain. Is course mein har step pehle asli GUI path dikhata hai aur phir matching <b>Lab shell</b> command. Lab ke models original learning models hain, HPE Aruba software nahi, lekin decisions ka order aur error codes asli product ko follow karte hain.</p>

<h3>Badi idea: indirection</h3>
<p>Seedha "alice ko VLAN 10" kyun nahi likh dete? Kyunki yeh scale nahi karta. Company mein hazaaron users, kai directories aur kai switch types hote hain. ClearPass insaan aur switch setting ke beech do layer ke labels rakhta hai. Attributes (jaise Department) ClearPass ke andar <b>roles</b> ban jaate hain. Roles <b>enforcement profiles</b> ban jaate hain. Profiles ek <b>switch role</b> ya VLAN ka naam dete hain. Jab Facilities pachaas contractors rakhta hai to aap koi rule nahi jodte: unke paas attribute pehle se hai, attribute role se map hai, aur role ka profile hai. Jab contractor VLAN badalta hai to aap sirf ek profile edit karte ho.</p>

<div class="eg"><p><b>Worked example.</b> Hamari lab site mein do laptops hain. Alice (Department Engineering) aur Bob (Department Contractor) switch ACCESS ke port 1/1/3 aur 1/1/4 par connect hote hain. Alice: service Wired 802.1X match hoti hai, PEAP password sahi hai, role mapping RM-WIRED Department=Engineering ko role ENGINEER bana deti hai, policy EPOL-WIRED ENGINEER ko EP-EMPLOYEE bhejti hai, profile Aruba-User-Role EMPLOYEE return karta hai aur switch use VLAN 10 mein daal deta hai. Bob wahi path follow karta hai, lekin stage 3 par RM-WIRED mein Contractor ka rule nahi hai, isliye uske paas sirf built-in role [User Authenticated] hai. Stage 4 par koi rule match nahi hota aur default profile [Deny Access Profile] lagta hai. Bob ka password sahi hone ke bawajood woh reject hota hai. Authentication aur authorization alag cheezein hain.</p></div>

<h3>Evidence kaisa dikhta hai</h3>
<p>Har request Access Tracker mein ek record chhodti hai. Summary tab har us stage ka naam deta hai jo chala. Ise flight recorder ki tarah padhna seekho.</p>
<pre class="out">Summary
-------
  Request ID                : R00000101-01-3f2a9c1e
  Login Status              : <span class="hl">REJECT</span>
  Username                  : bob
  Access Device Name        : ACCESS
  Service                   : Wired 802.1X
  Authentication Method     : [EAP PEAP],[EAP MSCHAPv2]
  Authentication Source     : [Local User Repository]
  Roles                     : <span class="hl">[User Authenticated]</span>
  Enforcement Profiles      : [Deny Access Profile]
  Enforcement Policy        : EPOL-WIRED</pre>
<p>Lab output, layout representative hai. Upar se neeche padho: service chali, authentication pass hui, sirf ek role mila, isliye policy default deny par gayi. Fault role mapping ya policy mein hai, password mein nahi.</p>

<div class="warn"><p><b>Common mistakes.</b> Alert kehta hai koi rule match nahi hua aur aap password debug karte ho. ClearPass ki problem mein switch edit karna, ya ulta. Yeh maan lena ki rule jodna kaafi hai: user ko purana result tab tak milta hai jab tak session dobara authenticate na ho.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Authentication succeed hui, isliye access mil gaya" galat hai. Access tabhi milta hai jab enforcement ek Accept profile chune. Sahi password, koi matching enforcement rule nahi aur deny default ka matlab Access-Reject.</p></div>

<div class="scn"><h4>Woh contractor jiska "password sahi hai"</h4><p>Monday ko ek contractor bolta hai ki wired network par login fail ho raha hai jabki password theek hai. Helpdesk ne password do baar reset kiya. Ek engineer ne Access Tracker khola aur authentication par ACCEPT dekha lekin aakhir mein default deny profile ke saath REJECT. Roles line mein sirf [User Authenticated] tha. Role mapping ko contractors ke baare mein kabhi bataya hi nahi gaya tha. Role mapping mein ek rule aur policy mein ek matching rule ne das minute mein fix kar diya.</p><p><b>Seekh:</b> kuch chhoone se pehle woh stage padho jahan chain ruki.</p></div>

<div class="iv"><p class="q">"Jab wired 802.1X request aati hai to ClearPass kya karta hai, step by step batao."</p><p>Strong answer: NAD ko source IP aur secret se pehchano, request ko pehli matching service mein classify karo, service ke methods se uske sources ke against authenticate karo, role mapping chalao jo roles banaye, enforcement policy ko order mein default profile ke saath evaluate karo, aur profile ke attributes jaise Aruba-User-Role return karo. Batao ki Access Tracker har stage dikhata hai aur enforcement sirf authentication ke time evaluate hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chain hai: service, authentication, role mapping, enforcement policy, enforcement profile.</li>
<li>Har stage pichhle stage ka output use karta hai, isliye galat early stage aage sab bigaad deta hai.</li>
<li>Attributes ClearPass roles banate hain; roles profiles banate hain; profiles switch settings le jaate hain.</li>
<li>GUI path Configuration hai; Lab shell text commands se usi ko mirror karta hai.</li>
<li>Authentication success ka matlab access nahi: enforcement tay karta hai.</li>
</ul></div>
`}};export{e as default};