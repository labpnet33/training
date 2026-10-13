var e={id:`services`,h:{en:`Services: templates, classification rules and first match`,hi:`Services: templates, classification rules aur first match`},body:{en:`
<p>Think of the front door of a hospital. One door, but patients, visitors, couriers and staff all need different counters. Somebody at the door looks at each person and says "you go to counter 3". In ClearPass that somebody is the <b>service list</b>. Every RADIUS request that passes the network device check is compared against the services, from the top of the list to the bottom, and the <b>first service whose classification rules match</b> handles the request. Nothing else in the chain can start until a service has been chosen.</p>

<h3>What a service is</h3>
<p>A <b>service</b> is a bundle: classification rules (when does this service apply), authentication methods, authentication sources, an optional role mapping policy and an enforcement policy. In the real GUI it lives under <b>Configuration &gt; Services</b>, and the list there shows the evaluation order, with a Reorder action. A service also has an enabled or disabled state. A disabled service is skipped.</p>

<h3>Service templates</h3>
<p>The GUI offers service <b>templates</b> (types) so you do not build rules from scratch. The three that matter for this track are the <b>802.1X Wired</b> template, the <b>MAC Authentication</b> template, and the <b>802.1X Wireless</b> template. ClearPass also ships many other types, such as web-based authentication, TACACS+ device administration and OnGuard posture services. Those are <b>not simulated in the lab</b> and are only previewed in later modules. The lab shell offers the first three as <code>wired-802.1x</code>, <code>wired-mac-auth</code> and <code>wireless-802.1x</code>.</p>
<p>The only difference between the wired and the wireless 802.1X template is the classification rule. Wired uses NAS-Port-Type Ethernet; wireless uses NAS-Port-Type Wireless-802.11.</p>

<h3>Classification rules</h3>
<p>A rule is three parts: an <b>attribute</b> (a namespace and a name, for example Radius:IETF:NAS-Port-Type), an <b>operator</b> (EQUALS, BELONGS_TO, CONTAINS and so on) and a <b>value</b>. A service has several rules and a match mode: <b>ALL</b> (every rule must be true) or <b>ANY</b> (one is enough). The standard wired templates use ALL.</p>
<table class="cmp"><tr><th>Template</th><th>Rule 1</th><th>Rule 2</th></tr>
<tr><td>Wired 802.1X</td><td>Radius:IETF:NAS-Port-Type EQUALS 15 (Ethernet)</td><td>Radius:IETF:Service-Type BELONGS_TO 1,2,8</td></tr>
<tr><td>Wired MAC auth</td><td>Radius:IETF:NAS-Port-Type EQUALS 15</td><td>Radius:IETF:Service-Type EQUALS 10 (Call-Check)</td></tr>
<tr><td>Wireless 802.1X</td><td>Radius:IETF:NAS-Port-Type EQUALS 19 (Wireless-802.11)</td><td>Radius:IETF:Service-Type BELONGS_TO 1,2,8</td></tr></table>
<p>Service-Type 1 is Login-User, 2 is Framed-User, 8 is Authenticate-Only and 10 is Call-Check, the value switches use when they authenticate a MAC address. This is why a MAC-auth request does not match the 802.1X service even though both come from the same port: the Service-Type differs. The rule values come from the RADIUS packet itself, so read them in the Input tab of an Access Tracker record instead of guessing.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Service list evaluated top to bottom">
<rect x="20" y="14" width="240" height="40" rx="8" fill="#bae6fd"/><text x="140" y="39" text-anchor="middle" class="svg-ink" font-size="13">1  Wired 802.1X</text>
<rect x="20" y="62" width="240" height="40" rx="8" fill="#bbf7d0"/><text x="140" y="87" text-anchor="middle" class="svg-ink" font-size="13">2  Wired MAC Auth</text>
<rect x="20" y="110" width="240" height="40" rx="8" fill="#e2e8f0"/><text x="140" y="135" text-anchor="middle" class="svg-ink" font-size="13">3  built-in services</text>
<rect x="20" y="158" width="240" height="40" rx="8" fill="#fed7aa"/><text x="140" y="183" text-anchor="middle" class="svg-ink" font-size="13">no match: error 9002</text>
<line x1="290" y1="30" x2="290" y2="180" stroke="#64748b" stroke-width="2"/><polygon points="290,190 284,178 296,178" fill="#64748b"/>
<text x="310" y="40" class="svg-ink" font-size="13">NAS-Port-Type 15, Service-Type 2:</text><text x="310" y="58" class="svg-accent" font-size="13">service 1 matches, stop here</text>
<text x="310" y="100" class="svg-ink" font-size="13">NAS-Port-Type 15, Service-Type 10:</text><text x="310" y="118" class="svg-accent" font-size="13">skips 1, matches service 2</text>
<text x="310" y="160" class="svg-ink" font-size="13">Matches nothing: no service runs</text>
</svg><p class="cap">Top to bottom, first match wins. Placing a broad service above a narrow one hides the narrow one.</p></div>

<h3>Lab shell: creating and reading a service</h3>
<p>GUI path: Configuration &gt; Services &gt; Add, choose the type, then fill the Authentication and Roles and Enforcement tabs. Lab shell equivalent:</p>
<pre class="code"><span class="c">! Lab shell on CPPM (mirrors Configuration &gt; Services)</span>
configuration service add "Wired 802.1X" template wired-802.1x
configuration service "Wired 802.1X" role-mapping RM-WIRED
configuration service "Wired 802.1X" enforcement-policy EPOL-WIRED
configuration service "Wired 802.1X" show</pre>
<pre class="out">Configuration &gt; Services
  Service: Wired 802.1X   Enabled
    Rules (match ALL):
      1. Radius:IETF:NAS-Port-Type EQUALS 15
      2. Radius:IETF:Service-Type BELONGS_TO 1,2,8
    Authentication methods: [EAP PEAP]
    Authentication sources: [Local User Repository]
    Role mapping: <span class="hl">RM-WIRED</span>
    Enforcement policy: <span class="hl">EPOL-WIRED</span></pre>
<p>Lab output, representative of the layout. You can also edit the rules with <code>rule add</code>, <code>rule remove</code>, <code>rule clear</code> and <code>rule match all|any</code>, change the position with <code>order N</code>, and switch the service with <code>enable</code> or <code>disable</code>.</p>

<h3>What happens when nothing matches</h3>
<p>If no enabled service matches, ClearPass cannot continue. The Access Tracker shows <b>error 9002, Failed to classify request to service</b>. The built-in services that ship with the product do not match wired user requests, so they will not rescue you. The usual causes are a service cloned from a wireless one (the rule still says 19), a Service-Type value missing from the list, a disabled service, or a request coming from a source you did not expect.</p>

<div class="warn"><p><b>Common mistakes.</b> Cloning a service and forgetting to change the rules. Writing the rule on an attribute the packet does not carry. Making a "temporary" test service with very loose rules and leaving it high in the list. Forgetting that ALL means every rule must be true.</p></div>
<div class="exam"><p><b>Exam trap.</b> The order of the <i>service list</i> is not the order of the rules inside one service. List order decides which service is tried first; match ALL or ANY decides how the rules inside one service combine. First match wins at the service level.</p></div>

<div class="scn"><h4>Everything fails after the wireless rollout</h4><p>A team cloned the wireless service to make a wired one for a branch. Users were fine at head office but nobody at the branch could connect. The Access Tracker showed error 9002 on every request and the Input tab showed NAS-Port-Type 15, while the service rule still required 19. Correcting the rule to 15 fixed all ports at once, and no user account, role or switch setting had been touched.</p><p><b>Lesson:</b> compare the Input tab values with the rules of the service before changing anything else.</p></div>

<div class="iv"><p class="q">"How does ClearPass decide which service handles a request?"</p><p>Strong answer: services are evaluated in list order, from top to bottom, and the first enabled service whose classification rules match wins. Rules compare RADIUS and connection attributes such as NAS-Port-Type and Service-Type, combined with match ALL or ANY. If none matches the request fails with 9002. Add that order and specificity are your design tools.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A service bundles classification rules, methods, sources, role mapping and enforcement policy.</li>
<li>Services are tried top to bottom and the first match wins.</li>
<li>Wired 802.1X uses NAS-Port-Type 15 and Service-Type 1, 2 or 8; MAC auth uses Service-Type 10.</li>
<li>No matching service means error 9002.</li>
<li>Read real attribute values in the Input tab; never guess them.</li>
</ul></div>
`,hi:`
<p>Hospital ke front door ko socho. Darwaza ek hai, lekin patients, visitors, couriers aur staff ko alag counters chahiye. Darwaze par koi har insaan ko dekh kar bolta hai "aap counter 3 par jao". ClearPass mein woh koi hai <b>service list</b>. Jo bhi RADIUS request network device check pass kar leti hai, use services ke saath upar se neeche tak compare kiya jaata hai, aur <b>pehli service jiske classification rules match karein</b> wahi request handle karti hai. Jab tak service chuni nahi jaati, chain mein aage kuch shuru nahi hota.</p>

<h3>Service kya hai</h3>
<p><b>Service</b> ek bundle hai: classification rules (yeh service kab lagu hogi), authentication methods, authentication sources, optional role mapping policy aur ek enforcement policy. Asli GUI mein yeh <b>Configuration &gt; Services</b> ke andar hoti hai, aur wahan list evaluation order dikhati hai, Reorder action ke saath. Service enabled ya disabled bhi hoti hai. Disabled service skip ho jaati hai.</p>

<h3>Service templates</h3>
<p>GUI service <b>templates</b> (types) deta hai taaki aap rules zero se na banao. Is track ke liye teen zaroori hain: <b>802.1X Wired</b> template, <b>MAC Authentication</b> template, aur <b>802.1X Wireless</b> template. ClearPass mein aur bhi kai types aate hain, jaise web-based authentication, TACACS+ device administration aur OnGuard posture services. Woh lab mein <b>not simulated</b> hain aur sirf aage ke modules mein preview hote hain. Lab shell pehle teen ko <code>wired-802.1x</code>, <code>wired-mac-auth</code> aur <code>wireless-802.1x</code> ke naam se deta hai.</p>
<p>Wired aur wireless 802.1X template mein sirf classification rule ka farak hai. Wired NAS-Port-Type Ethernet use karta hai; wireless NAS-Port-Type Wireless-802.11.</p>

<h3>Classification rules</h3>
<p>Rule ke teen hisse hote hain: ek <b>attribute</b> (namespace aur naam, jaise Radius:IETF:NAS-Port-Type), ek <b>operator</b> (EQUALS, BELONGS_TO, CONTAINS wagairah) aur ek <b>value</b>. Service mein kai rules aur ek match mode hota hai: <b>ALL</b> (har rule true ho) ya <b>ANY</b> (ek kaafi hai). Standard wired templates ALL use karte hain.</p>
<table class="cmp"><tr><th>Template</th><th>Rule 1</th><th>Rule 2</th></tr>
<tr><td>Wired 802.1X</td><td>Radius:IETF:NAS-Port-Type EQUALS 15 (Ethernet)</td><td>Radius:IETF:Service-Type BELONGS_TO 1,2,8</td></tr>
<tr><td>Wired MAC auth</td><td>Radius:IETF:NAS-Port-Type EQUALS 15</td><td>Radius:IETF:Service-Type EQUALS 10 (Call-Check)</td></tr>
<tr><td>Wireless 802.1X</td><td>Radius:IETF:NAS-Port-Type EQUALS 19 (Wireless-802.11)</td><td>Radius:IETF:Service-Type BELONGS_TO 1,2,8</td></tr></table>
<p>Service-Type 1 Login-User hai, 2 Framed-User, 8 Authenticate-Only aur 10 Call-Check, jo value switch tab bhejta hai jab woh MAC address authenticate karta hai. Isi wajah se MAC-auth request 802.1X service se match nahi karti, bhale dono same port se aayein: Service-Type alag hai. Rule values RADIUS packet se aati hain, isliye unhe andaze se nahi, Access Tracker record ke Input tab se padho.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Service list upar se neeche evaluate hoti hai">
<rect x="20" y="14" width="240" height="40" rx="8" fill="#bae6fd"/><text x="140" y="39" text-anchor="middle" class="svg-ink" font-size="13">1  Wired 802.1X</text>
<rect x="20" y="62" width="240" height="40" rx="8" fill="#bbf7d0"/><text x="140" y="87" text-anchor="middle" class="svg-ink" font-size="13">2  Wired MAC Auth</text>
<rect x="20" y="110" width="240" height="40" rx="8" fill="#e2e8f0"/><text x="140" y="135" text-anchor="middle" class="svg-ink" font-size="13">3  built-in services</text>
<rect x="20" y="158" width="240" height="40" rx="8" fill="#fed7aa"/><text x="140" y="183" text-anchor="middle" class="svg-ink" font-size="13">match nahi: error 9002</text>
<line x1="290" y1="30" x2="290" y2="180" stroke="#64748b" stroke-width="2"/><polygon points="290,190 284,178 296,178" fill="#64748b"/>
<text x="310" y="40" class="svg-ink" font-size="13">NAS-Port-Type 15, Service-Type 2:</text><text x="310" y="58" class="svg-accent" font-size="13">service 1 match, yahin ruko</text>
<text x="310" y="100" class="svg-ink" font-size="13">NAS-Port-Type 15, Service-Type 10:</text><text x="310" y="118" class="svg-accent" font-size="13">1 skip, service 2 match</text>
<text x="310" y="160" class="svg-ink" font-size="13">Kuch match nahi: koi service nahi chalti</text>
</svg><p class="cap">Upar se neeche, pehla match jeetta hai. Broad service ko narrow service ke upar rakhne se narrow wali chhup jaati hai.</p></div>

<h3>Lab shell: service banana aur padhna</h3>
<p>GUI path: Configuration &gt; Services &gt; Add, type chuno, phir Authentication aur Roles and Enforcement tabs bharo. Lab shell equivalent:</p>
<pre class="code"><span class="c">! Lab shell on CPPM (Configuration &gt; Services ko mirror karta hai)</span>
configuration service add "Wired 802.1X" template wired-802.1x
configuration service "Wired 802.1X" role-mapping RM-WIRED
configuration service "Wired 802.1X" enforcement-policy EPOL-WIRED
configuration service "Wired 802.1X" show</pre>
<pre class="out">Configuration &gt; Services
  Service: Wired 802.1X   Enabled
    Rules (match ALL):
      1. Radius:IETF:NAS-Port-Type EQUALS 15
      2. Radius:IETF:Service-Type BELONGS_TO 1,2,8
    Authentication methods: [EAP PEAP]
    Authentication sources: [Local User Repository]
    Role mapping: <span class="hl">RM-WIRED</span>
    Enforcement policy: <span class="hl">EPOL-WIRED</span></pre>
<p>Lab output, layout representative hai. Rules ko <code>rule add</code>, <code>rule remove</code>, <code>rule clear</code> aur <code>rule match all|any</code> se edit kar sakte ho, position <code>order N</code> se badalte ho, aur service ko <code>enable</code> ya <code>disable</code> se on ya off karte ho.</p>

<h3>Jab kuch match nahi karta</h3>
<p>Agar koi enabled service match nahi karti, ClearPass aage nahi badh sakta. Access Tracker <b>error 9002, Failed to classify request to service</b> dikhata hai. Product ke built-in services wired user requests se match nahi karte, isliye woh aapko bacha nahi paayenge. Aam wajah: wireless service se clone hui service (rule mein abhi bhi 19), list se Service-Type value gayab, disabled service, ya aisi source se request jo aapne socha nahi tha.</p>

<div class="warn"><p><b>Common mistakes.</b> Service clone karke rules badalna bhool jaana. Aise attribute par rule likhna jo packet mein hota hi nahi. "Temporary" test service ko bahut loose rules ke saath list mein upar chhod dena. Yeh bhoolna ki ALL ka matlab har rule true hona chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> <i>Service list</i> ka order ek service ke andar ke rules ka order nahi hai. List order tay karta hai kaunsi service pehle try hogi; match ALL ya ANY tay karta hai ki ek service ke rules kaise combine hote hain. Service level par pehla match jeetta hai.</p></div>

<div class="scn"><h4>Wireless rollout ke baad sab fail</h4><p>Ek team ne branch ke liye wired service banane ko wireless service clone ki. Head office ke users theek the lekin branch mein koi connect nahi ho paaya. Access Tracker ne har request par error 9002 dikhaya aur Input tab mein NAS-Port-Type 15 tha, jabki service rule ab bhi 19 maangta tha. Rule ko 15 karne se saare ports ek saath theek ho gaye, aur kisi user account, role ya switch setting ko chhua bhi nahi gaya.</p><p><b>Seekh:</b> kuch aur badalne se pehle Input tab ki values ko service ke rules se compare karo.</p></div>

<div class="iv"><p class="q">"ClearPass kaise tay karta hai ki request kaunsi service handle karegi?"</p><p>Strong answer: services list order mein, upar se neeche evaluate hoti hain, aur pehli enabled service jiske classification rules match karein jeet jaati hai. Rules NAS-Port-Type aur Service-Type jaise RADIUS aur connection attributes compare karte hain, match ALL ya ANY ke saath. Koi match na ho to request 9002 ke saath fail hoti hai. Ye jodo ki order aur specificity aapke design tools hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Service classification rules, methods, sources, role mapping aur enforcement policy ka bundle hai.</li>
<li>Services upar se neeche try hoti hain aur pehla match jeetta hai.</li>
<li>Wired 802.1X NAS-Port-Type 15 aur Service-Type 1, 2 ya 8 use karta hai; MAC auth Service-Type 10.</li>
<li>Koi service match na ho to error 9002.</li>
<li>Asli attribute values Input tab se padho; kabhi andaza mat lagao.</li>
</ul></div>
`}};export{e as default};