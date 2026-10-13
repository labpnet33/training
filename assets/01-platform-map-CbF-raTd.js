var e={id:`platform-map`,h:{en:`The Cisco platform map: what you will learn`,hi:`Cisco platform map: aap kya seekhoge`},body:{en:`
<p><b>What you will learn in this module.</b> Domain 3 of the Cisco 200-901 CCNAAUTO exam, <i>Cisco Platforms and Development</i>, is worth about 15% of the marks. It asks one big question in many forms: <b>"Here is a job. Which Cisco platform does it, and how do you call its API?"</b> By the end of these chapters you will know what the SDKs give you, what each platform manages (Meraki, Catalyst Center, ACI, Catalyst SD-WAN, NSO, Intersight, UCS Manager, Webex, Unified CM, Finesse and the security products), how each one logs you in, which objects you meet in its URLs, and how to read an API reference and build a correct call from it. You will also use two labs: one against a controller's northbound REST API and one where you repair a broken API script by reading status codes.</p>
<p><b>Prerequisites.</b> You already know HTTP methods and status codes (the HTTP and REST module), you can send requests from Python (auto-requests) and you can read JSON and YAML (auto-formats). We do not teach those again. We reuse them in every chapter.</p>

<h3>An analogy: a city with many municipal offices</h3>
<p>Imagine a big city. Water, electricity, property tax and the passport office are separate departments. Each has its own counter, its own forms, its own ID proof and its own rules. A clerk who knows the city well does not memorise every form. The clerk knows four questions to ask at any counter: <b>what does this office manage, how do I prove who I am, what are the things (objects) it keeps files on, and which form do I fill for my job?</b></p>
<p>Cisco platforms are those offices. Every platform is a product with its own API "counter". The questions are always the same, so once you learn them you can walk up to a platform you have never touched and make a first correct call within minutes. That skill, not memorising 200 URLs, is what the exam and a real job reward.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Cisco platform families">
<rect x="10" y="10" width="620" height="34" rx="8" fill="#fde68a"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="14">Your script, app, bot or pipeline (Python + requests or an SDK)</text>
<line x1="320" y1="44" x2="320" y2="62" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="62" width="300" height="46" rx="8" fill="#bae6fd"/><text x="160" y="82" text-anchor="middle" class="svg-ink" font-size="13">Network</text><text x="160" y="99" text-anchor="middle" class="svg-muted" font-size="12">Meraki, Catalyst Center, ACI, SD-WAN, NSO</text>
<rect x="330" y="62" width="300" height="46" rx="8" fill="#ddd6fe"/><text x="480" y="82" text-anchor="middle" class="svg-ink" font-size="13">Compute</text><text x="480" y="99" text-anchor="middle" class="svg-muted" font-size="12">Intersight, UCS Manager, UCS Director</text>
<rect x="10" y="118" width="300" height="46" rx="8" fill="#bbf7d0"/><text x="160" y="138" text-anchor="middle" class="svg-ink" font-size="13">Collaboration</text><text x="160" y="155" text-anchor="middle" class="svg-muted" font-size="12">Webex, xAPI devices, Unified CM, Finesse</text>
<rect x="330" y="118" width="300" height="46" rx="8" fill="#fed7aa"/><text x="480" y="138" text-anchor="middle" class="svg-ink" font-size="13">Security</text><text x="480" y="155" text-anchor="middle" class="svg-muted" font-size="12">XDR, FMC, Endpoint, ISE, Malware Analytics, Umbrella</text>
<rect x="10" y="176" width="620" height="38" rx="8" fill="#e2e8f0"/><text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="13">Each one: a base URL + an auth method + objects in the URL + JSON (or XML/SOAP) bodies</text>
<rect x="10" y="224" width="620" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="247" text-anchor="middle" class="svg-ink" font-size="13">Practise on DevNet sandboxes: Always-On (shared) or reservable (yours for a time slot)</text>
</svg><p class="cap">Four families of platforms, one repeatable way to call them.</p></div>

<h3>The four questions for every platform</h3>
<ol>
<li><b>What does it manage?</b> Switches and Wi-Fi (Meraki), a campus fabric (Catalyst Center), a data center fabric (ACI), WAN overlays (SD-WAN), multi-vendor services (NSO), servers (Intersight, UCS), meetings and chat (Webex), phones (Unified CM), threats (security products).</li>
<li><b>How do I authenticate?</b> An API key in a header, a token from a login call, a session cookie, OAuth 2.0 or a signed request. This differs most between platforms, so it is the first thing to look up.</li>
<li><b>What are its objects?</b> Meraki has organizations, networks and devices. ACI has tenants and a tree of managed objects. Webex has rooms, messages and people. The object names show up inside URLs.</li>
<li><b>Which call does my job?</b> Usually a GET to read, a POST to create or trigger, a PUT or PATCH to change and a DELETE to remove, with a JSON body you build from the reference.</li>
</ol>

<h3>The platforms at a glance</h3>
<table class="cmp"><tr><th>Platform</th><th>Manages</th><th>API style</th><th>Typical login</th></tr>
<tr><td>Meraki Dashboard</td><td>Cloud-managed switches, Wi-Fi, security appliances, cameras</td><td>REST + JSON</td><td>API key as a Bearer header</td></tr>
<tr><td>Catalyst Center</td><td>Campus wired and wireless, assurance, templates</td><td>REST + JSON</td><td>Token from a login POST</td></tr>
<tr><td>ACI (APIC)</td><td>Data center fabric policy</td><td>REST on managed objects</td><td>aaaLogin, then a cookie</td></tr>
<tr><td>Catalyst SD-WAN</td><td>WAN edges and controllers</td><td>REST + JSON</td><td>Session cookie plus a token</td></tr>
<tr><td>NSO</td><td>Services across many vendors</td><td>RESTCONF, NETCONF, YANG</td><td>Basic auth or token</td></tr>
<tr><td>Intersight</td><td>Servers from the cloud</td><td>REST + OData</td><td>Signed requests</td></tr>
<tr><td>UCS Manager</td><td>Servers behind fabric interconnects</td><td>XML API</td><td>aaaLogin, then a cookie</td></tr>
<tr><td>Webex</td><td>Spaces, messages, meetings, devices</td><td>REST + JSON, webhooks</td><td>Bearer token</td></tr>
<tr><td>Unified CM</td><td>Phones and call routing</td><td>AXL (SOAP), UDS (REST)</td><td>Basic auth</td></tr>
<tr><td>Security products</td><td>Firewalls, endpoints, identity, threat intel</td><td>REST + JSON</td><td>Token, key or OAuth 2.0</td></tr></table>
<p>Do not try to memorise this table now. Each chapter fills one part, and the last chapter gives you a "which API for which job" table to revise before the exam.</p>

<div class="eg"><p><b>Worked example.</b> Your manager says: "Every Monday, send the list of unreachable switches to our Webex space." Walk through the four questions. Switches belong to Catalyst Center (or Meraki if they are cloud-managed). Auth is a token (or an API key). The object is the network device list. The call is a GET on the device list, then a POST to the Webex messages API with the text. Two platforms, two logins, one small Python script. That is what domain 3 trains you to do.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Assuming all Cisco APIs behave like each other. They do not. A Meraki key goes in a header for every call; a Catalyst Center token expires and must be fetched again; ACI uses a cookie; UCS Manager speaks XML. Always read the authentication section of the reference first.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions often give you a platform name and ask which authentication step comes first, or give you a task and ask which platform's API fits. Learn each platform's login sentence and its main objects.</p></div>

<div class="scn"><h4>The intern who knew the four questions</h4><p>An intern at a retail chain was asked to export the list of access points from a platform she had never used. She did not search for a tutorial. She opened the API reference and answered the four questions: it manages Wi-Fi in the cloud, the key goes in a header, objects are organizations then networks then devices, and a GET on the devices list returns JSON. Her first call worked in ten minutes, and her script was reading 400 devices before lunch.</p><p><b>Lesson:</b> a repeatable method beats memorised URLs.</p></div>

<div class="iv"><p class="q">"You have never used platform X. How do you start automating it?"</p><p>A strong answer: find the API reference and the free sandbox, read the authentication section, list the main objects, make one GET with curl or Postman, then move the call into Python with requests or the vendor SDK, add error handling, and only then loop over many objects.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Domain 3 is about picking the right platform and building the right API call.</li>
<li>Ask four questions: what it manages, how to log in, what its objects are, which call does the job.</li>
<li>Authentication differs by platform: key, token, cookie, OAuth or signed request.</li>
<li>You reuse HTTP, requests and JSON skills from earlier modules.</li>
<li>Practise on DevNet sandboxes and in the two labs of this module.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Cisco 200-901 CCNAAUTO exam ka domain 3, <i>Cisco Platforms and Development</i>, lagbhag 15% marks ka hai. Yeh ek hi bada sawaal alag-alag roop mein poochta hai: <b>"Yeh ek kaam hai. Kaunsa Cisco platform yeh karta hai, aur uski API kaise call karte hain?"</b> In chapters ke ant tak aapko pata hoga ki SDKs kya dete hain, har platform kya manage karta hai (Meraki, Catalyst Center, ACI, Catalyst SD-WAN, NSO, Intersight, UCS Manager, Webex, Unified CM, Finesse aur security products), har ek mein login kaise hota hai, uske URLs mein kaunse objects milte hain, aur API reference padhkar sahi call kaise banate hain. Do labs bhi karoge: ek controller ki northbound REST API par, aur ek mein tootti hui API script ko status codes padhkar theek karoge.</p>
<p><b>Prerequisites.</b> Aap HTTP methods aur status codes jaante ho (the HTTP and REST module), Python se requests bhej sakte ho (auto-requests) aur JSON/YAML padh sakte ho (auto-formats). Inhe dobara nahi padhaenge. Har chapter mein inhi ka use hoga.</p>

<h3>Analogy: bahut saare municipal offices wala sheher</h3>
<p>Ek bade sheher ki sochiye. Paani, bijli, property tax aur passport office alag-alag departments hain. Har ek ka apna counter, apne forms, apna ID proof aur apne rules hain. Sheher ko achhe se jaanne wala clerk har form yaad nahi rakhta. Woh kisi bhi counter par chaar sawaal poochta hai: <b>yeh office kya manage karta hai, main apni pehchaan kaise doon, yeh kin cheezon (objects) ki files rakhta hai, aur mere kaam ke liye kaunsa form bharun?</b></p>
<p>Cisco platforms yahi offices hain. Har platform ek product hai jiska apna API "counter" hai. Sawaal hamesha wahi rehte hain, isliye ek baar seekh lo to jis platform ko kabhi chhua nahi us par bhi kuch minute mein pehli sahi call bana sakte ho. Yahi skill, na ki 200 URLs ratna, exam aur real job dono mein kaam aati hai.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Cisco platform families">
<rect x="10" y="10" width="620" height="34" rx="8" fill="#fde68a"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="14">Aapki script, app, bot ya pipeline (Python + requests ya SDK)</text>
<line x1="320" y1="44" x2="320" y2="62" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="62" width="300" height="46" rx="8" fill="#bae6fd"/><text x="160" y="82" text-anchor="middle" class="svg-ink" font-size="13">Network</text><text x="160" y="99" text-anchor="middle" class="svg-muted" font-size="12">Meraki, Catalyst Center, ACI, SD-WAN, NSO</text>
<rect x="330" y="62" width="300" height="46" rx="8" fill="#ddd6fe"/><text x="480" y="82" text-anchor="middle" class="svg-ink" font-size="13">Compute</text><text x="480" y="99" text-anchor="middle" class="svg-muted" font-size="12">Intersight, UCS Manager, UCS Director</text>
<rect x="10" y="118" width="300" height="46" rx="8" fill="#bbf7d0"/><text x="160" y="138" text-anchor="middle" class="svg-ink" font-size="13">Collaboration</text><text x="160" y="155" text-anchor="middle" class="svg-muted" font-size="12">Webex, xAPI devices, Unified CM, Finesse</text>
<rect x="330" y="118" width="300" height="46" rx="8" fill="#fed7aa"/><text x="480" y="138" text-anchor="middle" class="svg-ink" font-size="13">Security</text><text x="480" y="155" text-anchor="middle" class="svg-muted" font-size="12">XDR, FMC, Endpoint, ISE, Malware Analytics, Umbrella</text>
<rect x="10" y="176" width="620" height="38" rx="8" fill="#e2e8f0"/><text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="13">Har ek mein: base URL + auth method + URL mein objects + JSON (ya XML/SOAP) body</text>
<rect x="10" y="224" width="620" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="247" text-anchor="middle" class="svg-ink" font-size="13">DevNet sandboxes par practice: Always-On (shared) ya reservable (time slot ke liye aapka)</text>
</svg><p class="cap">Platforms ke chaar families, unhe call karne ka ek hi doharaya ja sakne wala tareeka.</p></div>

<h3>Har platform ke liye chaar sawaal</h3>
<ol>
<li><b>Yeh kya manage karta hai?</b> Switches aur Wi-Fi (Meraki), campus fabric (Catalyst Center), data center fabric (ACI), WAN overlays (SD-WAN), multi-vendor services (NSO), servers (Intersight, UCS), meetings aur chat (Webex), phones (Unified CM), threats (security products).</li>
<li><b>Authenticate kaise karun?</b> Header mein API key, login call se token, session cookie, OAuth 2.0 ya signed request. Platforms ke beech sabse zyada farak yahi hota hai, isliye sabse pehle yahi dekhna hai.</li>
<li><b>Iske objects kaunse hain?</b> Meraki mein organizations, networks aur devices. ACI mein tenants aur managed objects ka tree. Webex mein rooms, messages aur people. Object ke naam URLs ke andar dikhte hain.</li>
<li><b>Mere kaam ke liye kaunsi call?</b> Aam taur par padhne ke liye GET, banane ya trigger karne ke liye POST, badalne ke liye PUT ya PATCH, hatane ke liye DELETE, aur reference se banayi hui JSON body.</li>
</ol>

<h3>Platforms ek nazar mein</h3>
<table class="cmp"><tr><th>Platform</th><th>Kya manage karta hai</th><th>API style</th><th>Aam login</th></tr>
<tr><td>Meraki Dashboard</td><td>Cloud-managed switches, Wi-Fi, security appliances, cameras</td><td>REST + JSON</td><td>API key Bearer header mein</td></tr>
<tr><td>Catalyst Center</td><td>Campus wired aur wireless, assurance, templates</td><td>REST + JSON</td><td>Login POST se token</td></tr>
<tr><td>ACI (APIC)</td><td>Data center fabric policy</td><td>Managed objects par REST</td><td>aaaLogin, phir cookie</td></tr>
<tr><td>Catalyst SD-WAN</td><td>WAN edges aur controllers</td><td>REST + JSON</td><td>Session cookie plus token</td></tr>
<tr><td>NSO</td><td>Bahut vendors ke across services</td><td>RESTCONF, NETCONF, YANG</td><td>Basic auth ya token</td></tr>
<tr><td>Intersight</td><td>Cloud se servers</td><td>REST + OData</td><td>Signed requests</td></tr>
<tr><td>UCS Manager</td><td>Fabric interconnects ke peeche servers</td><td>XML API</td><td>aaaLogin, phir cookie</td></tr>
<tr><td>Webex</td><td>Spaces, messages, meetings, devices</td><td>REST + JSON, webhooks</td><td>Bearer token</td></tr>
<tr><td>Unified CM</td><td>Phones aur call routing</td><td>AXL (SOAP), UDS (REST)</td><td>Basic auth</td></tr>
<tr><td>Security products</td><td>Firewalls, endpoints, identity, threat intel</td><td>REST + JSON</td><td>Token, key ya OAuth 2.0</td></tr></table>
<p>Yeh table abhi ratne ki koshish mat karo. Har chapter ek hissa bharta hai, aur aakhri chapter mein exam se pehle revise karne ke liye "kaunsi API kis kaam ke liye" table milegi.</p>

<div class="eg"><p><b>Worked example.</b> Manager kehta hai: "Har Monday unreachable switches ki list hamare Webex space mein bhejo." Chaar sawaal lagao. Switches Catalyst Center ke hain (ya cloud-managed ho to Meraki ke). Auth token hai (ya API key). Object network device list hai. Call device list par GET, phir Webex messages API par text ke saath POST. Do platforms, do logins, ek chhoti Python script. Domain 3 yahi karna sikhata hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Yeh maan lena ki saari Cisco APIs ek jaisi hain. Aisa nahi hai. Meraki key har call ke header mein jaati hai; Catalyst Center token expire hota hai aur dobara lena padta hai; ACI cookie use karta hai; UCS Manager XML bolta hai. Hamesha pehle reference ka authentication section padho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawaal aksar platform ka naam dekar poochte hain ki pehla authentication step kaunsa hai, ya koi kaam dekar poochte hain ki kis platform ki API fit hogi. Har platform ka login wala vaakya aur uske main objects yaad rakho.</p></div>

<div class="scn"><h4>Intern jisne chaar sawaal jaane</h4><p>Ek retail chain ke intern ko aisi platform se access points ki list export karni thi jo usne kabhi use nahi ki thi. Usne tutorial nahi dhoondha. API reference kholi aur chaar sawaalon ke jawab likhe: yeh cloud mein Wi-Fi manage karta hai, key header mein jaati hai, objects organizations, phir networks, phir devices hain, aur devices list par GET JSON deta hai. Uski pehli call das minute mein chal gayi, aur lunch se pehle uski script 400 devices padh rahi thi.</p><p><b>Lesson:</b> ratte hue URLs se doharaya ja sakne wala tareeka behtar hai.</p></div>

<div class="iv"><p class="q">"Aapne platform X kabhi use nahi kiya. Uski automation kaise shuru karoge?"</p><p>Strong answer: API reference aur free sandbox dhoondo, authentication section padho, main objects likho, curl ya Postman se ek GET karo, phir call ko requests ya vendor SDK ke saath Python mein daalo, error handling jodo, aur uske baad hi bahut saare objects par loop chalao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Domain 3 sahi platform chunne aur sahi API call banane ke baare mein hai.</li>
<li>Chaar sawaal poochho: kya manage karta hai, login kaise, objects kaunse, kaunsi call kaam karti hai.</li>
<li>Authentication platform ke hisaab se badalta hai: key, token, cookie, OAuth ya signed request.</li>
<li>Pichhle modules ke HTTP, requests aur JSON skills yahan dobara use honge.</li>
<li>DevNet sandboxes aur is module ke do labs par practice karo.</li>
</ul></div>
`}};export{e as default};