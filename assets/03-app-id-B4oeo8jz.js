var e={id:`app-id`,h:{en:`Application identification: knowing what a flow is`,hi:`Application identification: flow kya hai yeh jaanna`},body:{en:`
<p>A security guard at an office gate does not only check that someone is a person; he checks which department they are going to, because the route inside depends on it. A branch router is in the same position. Before it can decide which road a packet should take, it must know <b>which application</b> the packet belongs to. An IP address and a port number are only a hint. This chapter explains how that knowledge is obtained and why a mistake here is the quietest failure in SD-WAN.</p>

<h3>Why ports are not enough</h3>
<p>In the past, firewalls and routers used the port number: TCP 80 meant web, UDP 5060 meant SIP signalling. Today almost everything uses TCP 443. A video meeting, a file-sharing service, a payment page and a software update can all arrive on the same port with the same TLS encryption. If policy only looked at ports it could not tell them apart. So modern platforms use <b>application identification</b>.</p>

<h3>How identification works (high level)</h3>
<ul>
<li><b>Signatures and DPI</b> (deep packet inspection): the device looks past the IP and TCP headers into the first packets of the session and compares patterns against a database of application signatures. Versa keeps this database as a signature package that the Director can distribute and update.</li>
<li><b>Metadata for encrypted traffic</b>: even when the payload is encrypted, the TLS handshake shows the server name (SNI) and certificate details. These give strong hints about the application.</li>
<li><b>Behaviour and caching</b>: some platforms remember that a server address and port were recently identified as an application and reuse that result for new flows.</li>
<li><b>Application families and groups</b>: applications belong to families (for example collaboration, streaming, business). A rule can match a single application, a group, or a whole family.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Application identification pipeline">
<rect x="15" y="60" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="70" y="88" text-anchor="middle" class="svg-ink" font-size="13">New flow</text><text x="70" y="106" text-anchor="middle" class="svg-muted" font-size="12">first packets</text>
<rect x="165" y="60" width="130" height="60" rx="8" fill="#bae6fd"/><text x="230" y="86" text-anchor="middle" class="svg-ink" font-size="13">DPI + signatures</text><text x="230" y="104" text-anchor="middle" class="svg-muted" font-size="12">SNI, patterns</text>
<rect x="335" y="60" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="395" y="86" text-anchor="middle" class="svg-ink" font-size="13">Application</text><text x="395" y="104" text-anchor="middle" class="svg-muted" font-size="12">voice, erp, web</text>
<rect x="495" y="60" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="560" y="86" text-anchor="middle" class="svg-ink" font-size="13">Policy rule</text><text x="560" y="104" text-anchor="middle" class="svg-muted" font-size="12">match, then steer</text>
<line x1="125" y1="90" x2="165" y2="90" stroke="#64748b" stroke-width="2"/><line x1="295" y1="90" x2="335" y2="90" stroke="#64748b" stroke-width="2"/><line x1="455" y1="90" x2="495" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">Wrong or unknown application here = the rule never matches</text>
</svg><p class="cap">The policy engine can only match what the identification step reports.</p></div>

<div class="note"><p>Identification can need several packets. For the first few packets of a flow the application may still be "unknown". Real platforms handle this with caching, pre-classification or by re-evaluating the flow once the application is known. The exact behaviour depends on the release, so check the documentation of the version you run.</p></div>

<h3>Custom applications</h3>
<p>Your business has an in-house ERP that no vendor database knows. You define a <b>custom application</b> by matching what you know: destination addresses, ports, a domain name, or a URL pattern. Give it a name (for example ERP) and use that name in rules. Custom applications also help when you want to treat one specific SaaS tenant differently from the rest of a family.</p>

<h3>Applications in the course model</h3>
<p>The lab CLI skips DPI and gives you a fixed vocabulary of application names so that you can focus on steering. In a rule you can write:</p>
<pre class="code"><span class="c">! allowed values after "match application"</span>
set orgs org-services Acme sd-wan policies CORP rules R-VOICE match application voice
<span class="c">! other names: video, erp, web, backup, any</span></pre>
<p><code>any</code> matches every application. <code>show ... path-selection application &lt;app&gt;</code> asks the model: "if a flow of this application started now, what would the policy do?"</p>

<div class="eg"><p><b>Worked example.</b> Policy CORP has one rule, R-VOICE, with match application <code>video</code> (a typo for voice). Voice call arrives: the engine asks "is any rule matching voice?" The answer is no. There is no error, no log line, no warning in the rule. The flow falls to the default behaviour and is load-balanced over every tunnel that is up. A video call to the same site would match R-VOICE and be steered over MPLS, which is exactly the opposite of the intention. You will meet this case in the rule-match lab.</p></div>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Wrong match silently ignored">
<rect x="20" y="30" width="170" height="60" rx="8" fill="#fde68a"/><text x="105" y="56" text-anchor="middle" class="svg-ink" font-size="13">Flow: voice</text><text x="105" y="74" text-anchor="middle" class="svg-muted" font-size="12">from Delhi PC</text>
<rect x="235" y="30" width="190" height="60" rx="8" fill="#fed7aa"/><text x="330" y="56" text-anchor="middle" class="svg-ink" font-size="13">R-VOICE matches video</text><text x="330" y="74" text-anchor="middle" class="svg-muted" font-size="12">no match for voice</text>
<rect x="470" y="30" width="150" height="60" rx="8" fill="#e2e8f0"/><text x="545" y="56" text-anchor="middle" class="svg-ink" font-size="13">ECMP on all</text><text x="545" y="74" text-anchor="middle" class="svg-muted" font-size="12">tunnels that are up</text>
<line x1="190" y1="60" x2="235" y2="60" stroke="#64748b" stroke-width="2"/><line x1="425" y1="60" x2="470" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">No error is shown. The policy simply does nothing for voice.</text>
</svg><p class="cap">A syntactically valid but wrong match produces silent default behaviour.</p></div>

<div class="warn"><p><b>Common mistakes:</b> matching a port instead of an application for encrypted traffic; typing a similar application name; forgetting that custom apps must exist before a rule can use them; assuming a rule is working because it committed. A commit only proves the syntax is valid.</p></div>
<div class="exam"><p><b>Exam trap:</b> a rule that does not match is not a failure of the forwarding profile or SLA. The symptom is "traffic is balanced as if no policy existed".</p></div>

<div class="scn"><h4>The new video platform</h4><p>A company moves from one video platform to another. The old rule matched the old application and steered it over MPLS. After the switch, meetings stutter. Analytics shows the new platform is identified under a different application name, so no rule matches and the traffic rides the Internet circuit. The engineer adds the new application to the rule (or creates a group) and the meetings recover.</p><p><b>Lesson:</b> Whenever applications change, check that the identification result and the rule still agree.</p></div>

<div class="iv"><p class="q">"Why not just match on port numbers?"</p><p>Most business and cloud applications share TCP 443, so ports cannot distinguish them. SD-WAN uses DPI signatures, TLS metadata such as SNI and custom application definitions. Mention that a wrong application in a rule fails silently and falls back to default load balancing.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy matches the application reported by identification, not just ports.</li>
<li>DPI signatures, TLS metadata and custom apps are the main tools.</li>
<li>Lab names: voice, video, erp, web, backup, any.</li>
<li>A rule with the wrong application commits fine and silently never matches.</li>
</ul></div>
`,hi:`
<p>Office gate ka security guard sirf yeh check nahi karta ki koi insaan hai; woh yeh bhi check karta hai ki woh kaunse department ja raha hai, kyunki andar ka route usi par depend karta hai. Branch router bhi isi position mein hai. Packet kaunsa road le, yeh decide karne se pehle use jaanna padta hai ki packet <b>kaunsi application</b> ka hai. IP address aur port number sirf ek hint hain. Yeh chapter batata hai ki yeh knowledge kaise milti hai aur yahan ki galti SD-WAN ki sabse khamosh failure kyun hai.</p>

<h3>Sirf ports kaafi kyun nahi hain</h3>
<p>Pehle firewalls aur routers port number use karte the: TCP 80 matlab web, UDP 5060 matlab SIP signalling. Aaj lagbhag sab kuch TCP 443 use karta hai. Video meeting, file-sharing service, payment page aur software update sab same port par same TLS encryption ke saath aa sakte hain. Agar policy sirf ports dekhti to unhe alag nahi kar paati. Isliye modern platforms <b>application identification</b> use karte hain.</p>

<h3>Identification kaise kaam karti hai (high level)</h3>
<ul>
<li><b>Signatures aur DPI</b> (deep packet inspection): device IP aur TCP headers ke aage session ke pehle packets mein dekhta hai aur patterns ko application signatures ke database se compare karta hai. Versa yeh database ek signature package ke roop mein rakhta hai jo Director distribute aur update kar sakta hai.</li>
<li><b>Encrypted traffic ke liye metadata</b>: payload encrypted hone par bhi TLS handshake server name (SNI) aur certificate details dikhata hai. Yeh application ke baare mein strong hints dete hain.</li>
<li><b>Behaviour aur caching</b>: kuch platforms yaad rakhte hain ki ek server address aur port abhi application ke roop mein identify hue the aur naye flows ke liye wahi result reuse karte hain.</li>
<li><b>Application families aur groups</b>: applications families mein aati hain (jaise collaboration, streaming, business). Rule ek single application, ek group ya poori family match kar sakta hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Application identification pipeline">
<rect x="15" y="60" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="70" y="88" text-anchor="middle" class="svg-ink" font-size="13">Naya flow</text><text x="70" y="106" text-anchor="middle" class="svg-muted" font-size="12">pehle packets</text>
<rect x="165" y="60" width="130" height="60" rx="8" fill="#bae6fd"/><text x="230" y="86" text-anchor="middle" class="svg-ink" font-size="13">DPI + signatures</text><text x="230" y="104" text-anchor="middle" class="svg-muted" font-size="12">SNI, patterns</text>
<rect x="335" y="60" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="395" y="86" text-anchor="middle" class="svg-ink" font-size="13">Application</text><text x="395" y="104" text-anchor="middle" class="svg-muted" font-size="12">voice, erp, web</text>
<rect x="495" y="60" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="560" y="86" text-anchor="middle" class="svg-ink" font-size="13">Policy rule</text><text x="560" y="104" text-anchor="middle" class="svg-muted" font-size="12">match, phir steer</text>
<line x1="125" y1="90" x2="165" y2="90" stroke="#64748b" stroke-width="2"/><line x1="295" y1="90" x2="335" y2="90" stroke="#64748b" stroke-width="2"/><line x1="455" y1="90" x2="495" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">Yahan galat ya unknown application = rule kabhi match nahi hota</text>
</svg><p class="cap">Policy engine sirf wahi match kar sakta hai jo identification step report karta hai.</p></div>

<div class="note"><p>Identification ko kai packets lag sakte hain. Flow ke pehle kuch packets ke liye application abhi bhi "unknown" ho sakti hai. Real platforms ise caching, pre-classification ya application pata chalne par flow ko dobara evaluate karke handle karte hain. Exact behaviour release par depend karta hai, isliye jo version aap chala rahe ho uska documentation dekho.</p></div>

<h3>Custom applications</h3>
<p>Aapke business ka in-house ERP hai jise koi vendor database nahi jaanta. Aap jo jaante ho woh match karke ek <b>custom application</b> define karte ho: destination addresses, ports, domain name ya URL pattern. Use ek naam do (jaise ERP) aur rules mein wahi naam use karo. Custom applications tab bhi kaam aati hain jab aap ek specific SaaS tenant ko family ke baaki se alag treat karna chahte ho.</p>

<h3>Course model mein applications</h3>
<p>Lab CLI DPI skip karta hai aur application names ki ek fixed vocabulary deta hai taaki aap steering par focus kar sako. Rule mein aap likh sakte ho:</p>
<pre class="code"><span class="c">! "match application" ke baad allowed values</span>
set orgs org-services Acme sd-wan policies CORP rules R-VOICE match application voice
<span class="c">! baaki names: video, erp, web, backup, any</span></pre>
<p><code>any</code> har application match karta hai. <code>show ... path-selection application &lt;app&gt;</code> model se poochta hai: "agar is application ka flow abhi shuru ho to policy kya karegi?"</p>

<div class="eg"><p><b>Worked example.</b> Policy CORP mein ek rule hai, R-VOICE, jiska match application <code>video</code> hai (voice ki jagah typo). Voice call aati hai: engine poochta hai "kya koi rule voice match karta hai?" Jawab hai nahi. Koi error nahi, koi log line nahi, rule mein koi warning nahi. Flow default behaviour par chala jaata hai aur har up tunnel par load-balance ho jaata hai. Same site ki video call R-VOICE match karti aur MPLS par steer hoti, jo intention ka bilkul ulta hai. Yeh case aap rule-match lab mein milenge.</p></div>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Galat match chupchaap ignore">
<rect x="20" y="30" width="170" height="60" rx="8" fill="#fde68a"/><text x="105" y="56" text-anchor="middle" class="svg-ink" font-size="13">Flow: voice</text><text x="105" y="74" text-anchor="middle" class="svg-muted" font-size="12">Delhi PC se</text>
<rect x="235" y="30" width="190" height="60" rx="8" fill="#fed7aa"/><text x="330" y="56" text-anchor="middle" class="svg-ink" font-size="13">R-VOICE matches video</text><text x="330" y="74" text-anchor="middle" class="svg-muted" font-size="12">voice ka match nahi</text>
<rect x="470" y="30" width="150" height="60" rx="8" fill="#e2e8f0"/><text x="545" y="56" text-anchor="middle" class="svg-ink" font-size="13">ECMP on all</text><text x="545" y="74" text-anchor="middle" class="svg-muted" font-size="12">up tunnels par</text>
<line x1="190" y1="60" x2="235" y2="60" stroke="#64748b" stroke-width="2"/><line x1="425" y1="60" x2="470" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">Koi error nahi dikhta. Policy voice ke liye kuch nahi karti.</text>
</svg><p class="cap">Syntax mein sahi lekin galat match chupchaap default behaviour deta hai.</p></div>

<div class="warn"><p><b>Common mistakes:</b> encrypted traffic ke liye application ki jagah port match karna; milta-julta application name type karna; yeh bhoolna ki custom apps rule use karne se pehle exist karni chahiye; yeh maan lena ki rule kaam kar raha hai kyunki commit ho gaya. Commit sirf syntax valid hone ka proof hai.</p></div>
<div class="exam"><p><b>Exam trap:</b> jo rule match nahi karta woh forwarding profile ya SLA ki failure nahi hai. Symptom hai "traffic aise balance ho rahi hai jaise koi policy hai hi nahi".</p></div>

<div class="scn"><h4>Naya video platform</h4><p>Ek company ek video platform se doosre par move karti hai. Purana rule purani application match karta tha aur use MPLS par steer karta tha. Switch ke baad meetings atakti hain. Analytics dikhata hai ki naya platform alag application name se identify ho raha hai, isliye koi rule match nahi karta aur traffic Internet circuit par jaata hai. Engineer nayi application rule mein add karta hai (ya group banata hai) aur meetings theek ho jaati hain.</p><p><b>Lesson:</b> Jab bhi applications badlein, check karo ki identification result aur rule ab bhi agree karte hain.</p></div>

<div class="iv"><p class="q">"Sirf port numbers par match kyun nahi karte?"</p><p>Zyadatar business aur cloud applications TCP 443 share karti hain, isliye ports unhe alag nahi kar sakte. SD-WAN DPI signatures, SNI jaisa TLS metadata aur custom application definitions use karta hai. Yeh zaroor batao ki rule mein galat application silently fail hoti hai aur default load balancing par fall back karti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy identification ki batayi application match karti hai, sirf ports nahi.</li>
<li>DPI signatures, TLS metadata aur custom apps main tools hain.</li>
<li>Lab names: voice, video, erp, web, backup, any.</li>
<li>Galat application wala rule commit ho jaata hai aur chupchaap kabhi match nahi karta.</li>
</ul></div>
`}};export{e as default};