var e={id:`initial-contact`,h:{en:`How an engine contacts the SMC: initial contact and trust`,hi:`Engine SMC se kaise contact karta hai: initial contact aur trust`},body:{en:`
<p>When a new employee joins a company, the HR team creates a record and gives them a joining letter with a one-time code. On day one the employee shows the letter at reception, the code is checked against the record, an ID badge is issued, and from then on the employee is trusted and can enter by badge. An engine joining the SMC follows the same pattern: first you <b>create the engine record</b> in the SMC, which produces a <b>one-time password</b>; then the engine presents that password once; after that the two sides <b>trust</b> each other and use their own certificates and keys.</p>

<h3>Step by step: initial contact</h3>
<ol>
<li><b>Create the engine element</b> in the Engines page of the Management Client. You give it a name (<code>NK-PUNE-FW</code>), the role (Firewall/VPN), the interfaces with their addresses, and which interface is the control interface (eth0, 10.0.0.1/24). When the initial configuration is saved, the SMC generates a <b>one-time password</b> for this engine.</li>
<li><b>Note the one-time password.</b> You need it exactly once. If you lose it, you create a new one in the SMC; do not reuse an old one.</li>
<li><b>On the engine</b> the command line tool <code>sg-contact-mgmt</code> contacts the Management Server and establishes trust, using the one-time password. In the simulator the form is <code>sg-contact-mgmt &lt;smc-ip&gt; &lt;one-time-password&gt;</code>, for example the SMC 10.0.0.10. The real tool has more options; check the documentation for your NGFW version.</li>
<li>The engine and the Management Server exchange certificates. From now on they authenticate each other without the one-time password, which is now spent.</li>
<li>The engine status moves from <b>Unknown</b> to <b>No Policy Installed</b>.</li>
<li>You <b>install a policy</b> (the Initial Policy). The status becomes <b>Online</b>.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Engine status flow">
<rect x="10" y="30" width="130" height="60" rx="10" fill="#e2e8f0"/><text x="75" y="58" text-anchor="middle" class="svg-ink" font-size="13">Unknown</text><text x="75" y="76" text-anchor="middle" class="svg-muted" font-size="11">engine element created</text>
<rect x="255" y="30" width="130" height="60" rx="10" fill="#fde68a"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="13">No Policy Installed</text><text x="320" y="76" text-anchor="middle" class="svg-muted" font-size="11">trust established</text>
<rect x="500" y="30" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="565" y="58" text-anchor="middle" class="svg-ink" font-size="13">Online</text><text x="565" y="76" text-anchor="middle" class="svg-muted" font-size="11">policy running</text>
<line x1="140" y1="60" x2="255" y2="60" stroke="#64748b" stroke-width="2"/><line x1="385" y1="60" x2="500" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="197" y="50" text-anchor="middle" class="svg-accent" font-size="11">sg-contact-mgmt</text>
<text x="442" y="50" text-anchor="middle" class="svg-accent" font-size="11">Install policy</text>
<rect x="10" y="140" width="230" height="90" rx="10" fill="#ddd6fe"/><text x="125" y="165" text-anchor="middle" class="svg-ink" font-size="13">SMC 10.0.0.10</text><text x="125" y="188" text-anchor="middle" class="svg-muted" font-size="11">must reach engine 10.0.0.1</text><text x="125" y="208" text-anchor="middle" class="svg-muted" font-size="11">listens for the engine on tcp 8902</text>
<rect x="400" y="140" width="230" height="90" rx="10" fill="#bae6fd"/><text x="515" y="165" text-anchor="middle" class="svg-ink" font-size="13">Engine NK-PUNE-FW</text><text x="515" y="188" text-anchor="middle" class="svg-muted" font-size="11">control eth0 10.0.0.1</text><text x="515" y="208" text-anchor="middle" class="svg-muted" font-size="11">must reach SMC on tcp 8902</text>
<line x1="240" y1="185" x2="400" y2="185" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
</svg><p class="cap">Two things must work: the engine reaches the SMC, and the SMC reaches the engine.</p></div>

<h3>The trust relationship</h3>
<p><b>Trust</b> means each side has accepted the other's identity. The one-time password is only the key to start the process; it is not the long-term protection. After trust is established, traffic between the engine and the SMC is authenticated and encrypted. Anyone who steals an unused one-time password can try to enrol a fake engine, so treat it like a secret and do not paste it into chat or tickets. Once used, it is worthless.</p>

<h3>Engine statuses you will see</h3>
<table class="cmp"><tr><th>Status</th><th>Meaning</th></tr>
<tr><td><b>Unknown</b></td><td>The SMC has no status from the engine: before first contact, or after a timeout</td></tr>
<tr><td><b>No Policy Installed</b></td><td>Contact works, trust exists, no policy has been installed yet</td></tr>
<tr><td><b>Online</b></td><td>The node is running and processing traffic under an installed policy</td></tr>
<tr><td><b>Offline, Standby, Locked online</b></td><td>States used in clusters and maintenance; later modules</td></tr>
</table>
<p>Before first contact the engine is shown as "under work" until the first policy upload; check the documentation for your NGFW version for exact wording. In the lab, "Online" means two checks together: the engine has contact with the SMC <i>and</i> a policy is installed. Not just one.</p>

<h3>Which address does the SMC use? Locations and contact addresses</h3>
<p>The SMC must reach the engine, and the engine must reach the SMC. If both sit in the same network, they use their normal control IP addresses (10.0.0.10 and 10.0.0.1). If NAT sits between them, the address one side sees is not the address the other side owns. SMC components can therefore have a <b>contact address</b>: a translated address that other Locations must use. A <b>Location</b> is a label that groups elements that can reach each other without translation. Rule of thumb: components in the same Location use the real control address; components in a different Location use a Location-specific contact address if one exists, else the element's default contact address, else the plain address. Engines with a changing IP address or behind NAT may start the connection themselves (node-initiated contact). The lab has one SMC Location and one engine Location and does not simulate contact timers.</p>

<div class="eg"><p><b>Worked example.</b> Create NK-PUNE-FW with eth0 10.0.0.1/24 as the control interface. The SMC shows a one-time password, say <code>kX93-demo-otp</code> (invented). On FW1 you run <code>sg-contact-mgmt 10.0.0.10 kX93-demo-otp</code>. The tool reports success; the Engines page changes from Unknown to No Policy Installed. You pick the Initial Policy and press Install policy. A few seconds later the status is Online and Monitoring shows the node green.</p></div>

<pre class="code"><span class="c">! on the engine FW1 (engine command line)</span>
sg-contact-mgmt 10.0.0.10 kX93-demo-otp
<span class="c">! afterwards, check</span>
sg-status</pre>
<p>Reference configuration (not run in the simulator): on a real engine, <code>sg-status</code> and <code>sg-version</code> show node status and software version; the option list of <code>sg-contact-mgmt</code> differs between releases, so check the documentation for your NGFW version.</p>

<div class="warn"><p><b>Common mistakes.</b> Using the wrong SMC IP in the command. Typing the one-time password wrongly or using an old one after the engine element was recreated. Control IP typed wrong in the engine element, so the SMC cannot reach back. Installing a policy that drops management contact. Forgetting that firewall rules between SMC and engine (or a NAT) must allow TCP 8902.</p></div>
<div class="exam"><p><b>Exam trap.</b> Contact is two-way. Initial contact creates trust, but Online needs a policy as well. "No Policy Installed" is a good status: it means contact worked.</p></div>

<div class="scn"><h4>Stuck at Unknown after the command succeeded</h4><p>A trainee at MyPnetLab ran sg-contact-mgmt successfully, but the Engines page still showed Unknown. They checked the engine element and found the control IP was typed as 10.0.0.11 instead of 10.0.0.1. The engine could talk to the SMC, but the SMC tried to answer to a non-existent address. After correcting the address and re-running contact with a new one-time password, the status became No Policy Installed, and after the install, Online.</p><p><b>Lesson:</b> the engine reaching the SMC is only half. The SMC must reach the engine too.</p></div>

<div class="iv"><p class="q">"Walk me through how a new engine is brought under SMC management."</p><p>Strong answer: create the engine element with interfaces and control interface; the SMC generates a one-time password at initial configuration; on the engine run sg-contact-mgmt with the SMC address and the password to establish trust; status changes from Unknown to No Policy Installed; then install a policy that allows management contact, and the node becomes Online. Mention contact addresses and Locations when NAT is in the path.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Create the engine element first; the SMC generates a one-time password.</li>
<li>sg-contact-mgmt on the engine establishes trust; the password is used once.</li>
<li>Status flow: Unknown, then No Policy Installed, then Online after Install policy.</li>
<li>Contact is two-way: engine to SMC on tcp 8902, SMC to the engine control IP.</li>
<li>Locations and contact addresses solve NAT between SMC and engine.</li>
</ul></div>
`,hi:`
<p>Jab koi naya employee company join karta hai to HR record banata hai aur ek one-time code wala joining letter deta hai. Pehle din employee reception par letter dikhata hai, code record se match hota hai, ID badge milta hai, aur uske baad employee trusted hai aur badge se andar aa sakta hai. SMC join karne wala engine bhi yahi pattern follow karta hai: pehle SMC mein <b>engine record banate ho</b>, jisse ek <b>one-time password</b> banta hai; phir engine woh password ek baar present karta hai; uske baad dono sides ek doosre par <b>trust</b> karte hain aur apne certificates aur keys use karte hain.</p>

<h3>Step by step: initial contact</h3>
<ol>
<li>Management Client ke Engines page par <b>engine element banao</b>. Aap naam (<code>NK-PUNE-FW</code>), role (Firewall/VPN), addresses ke saath interfaces, aur control interface (eth0, 10.0.0.1/24) dete ho. Initial configuration save hote hi SMC is engine ke liye <b>one-time password</b> generate karta hai.</li>
<li><b>One-time password note karo.</b> Yeh sirf ek baar chahiye. Kho jaye to SMC mein naya banao; purana dobara use mat karo.</li>
<li><b>Engine par</b> command line tool <code>sg-contact-mgmt</code> Management Server se contact karta hai aur one-time password se trust establish karta hai. Simulator mein form hai <code>sg-contact-mgmt &lt;smc-ip&gt; &lt;one-time-password&gt;</code>, jaise SMC 10.0.0.10. Real tool mein aur options hain; apne NGFW version ki documentation check karo.</li>
<li>Engine aur Management Server certificates exchange karte hain. Ab se woh one-time password ke bina ek doosre ko authenticate karte hain; password ab kharch ho chuka hai.</li>
<li>Engine status <b>Unknown</b> se <b>No Policy Installed</b> mein badalta hai.</li>
<li>Aap <b>policy install</b> karte ho (Initial Policy). Status <b>Online</b> ho jata hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Engine status flow">
<rect x="10" y="30" width="130" height="60" rx="10" fill="#e2e8f0"/><text x="75" y="58" text-anchor="middle" class="svg-ink" font-size="13">Unknown</text><text x="75" y="76" text-anchor="middle" class="svg-muted" font-size="11">engine element bana</text>
<rect x="255" y="30" width="130" height="60" rx="10" fill="#fde68a"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="13">No Policy Installed</text><text x="320" y="76" text-anchor="middle" class="svg-muted" font-size="11">trust ban gaya</text>
<rect x="500" y="30" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="565" y="58" text-anchor="middle" class="svg-ink" font-size="13">Online</text><text x="565" y="76" text-anchor="middle" class="svg-muted" font-size="11">policy chal rahi hai</text>
<line x1="140" y1="60" x2="255" y2="60" stroke="#64748b" stroke-width="2"/><line x1="385" y1="60" x2="500" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="197" y="50" text-anchor="middle" class="svg-accent" font-size="11">sg-contact-mgmt</text>
<text x="442" y="50" text-anchor="middle" class="svg-accent" font-size="11">Install policy</text>
<rect x="10" y="140" width="230" height="90" rx="10" fill="#ddd6fe"/><text x="125" y="165" text-anchor="middle" class="svg-ink" font-size="13">SMC 10.0.0.10</text><text x="125" y="188" text-anchor="middle" class="svg-muted" font-size="11">engine 10.0.0.1 reach karna chahiye</text><text x="125" y="208" text-anchor="middle" class="svg-muted" font-size="11">engine ke liye tcp 8902 par sunta hai</text>
<rect x="400" y="140" width="230" height="90" rx="10" fill="#bae6fd"/><text x="515" y="165" text-anchor="middle" class="svg-ink" font-size="13">Engine NK-PUNE-FW</text><text x="515" y="188" text-anchor="middle" class="svg-muted" font-size="11">control eth0 10.0.0.1</text><text x="515" y="208" text-anchor="middle" class="svg-muted" font-size="11">SMC tcp 8902 par reach kare</text>
<line x1="240" y1="185" x2="400" y2="185" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
</svg><p class="cap">Do cheezein chalni chahiye: engine SMC tak pahunche, aur SMC engine tak pahunche.</p></div>

<h3>Trust relationship</h3>
<p><b>Trust</b> matlab har side ne doosri side ki identity accept kar li hai. One-time password sirf process shuru karne ki chaabi hai; long-term protection nahi. Trust banne ke baad engine aur SMC ke beech traffic authenticated aur encrypted hota hai. Koi unused one-time password chura le to fake engine enrol karne ki koshish kar sakta hai, isliye ise secret ki tarah treat karo aur chat ya tickets mein paste mat karo. Use hone ke baad woh bekaar hai.</p>

<h3>Engine statuses jo aap dekhoge</h3>
<table class="cmp"><tr><th>Status</th><th>Matlab</th></tr>
<tr><td><b>Unknown</b></td><td>SMC ko engine se status nahi mila: first contact se pehle, ya timeout ke baad</td></tr>
<tr><td><b>No Policy Installed</b></td><td>Contact kaam karta hai, trust hai, abhi tak policy install nahi hui</td></tr>
<tr><td><b>Online</b></td><td>Node chal raha hai aur installed policy ke under traffic process kar raha hai</td></tr>
<tr><td><b>Offline, Standby, Locked online</b></td><td>Clusters aur maintenance mein use hone wale states; aage ke modules</td></tr>
</table>
<p>First contact se pehle engine pehli policy upload tak "under work" dikhta hai; exact wording ke liye apne NGFW version ki documentation check karo. Lab mein "Online" matlab do checks ek saath: engine ka SMC se contact hai <i>aur</i> policy installed hai. Sirf ek nahi.</p>

<h3>SMC kaunsa address use karta hai? Locations aur contact addresses</h3>
<p>SMC ko engine reach karna hai, aur engine ko SMC. Dono ek hi network mein hon to normal control IP addresses use hote hain (10.0.0.10 aur 10.0.0.1). Beech mein NAT ho to ek side ko jo address dikhta hai woh doosri side ka asli address nahi hota. Isliye SMC components ka <b>contact address</b> ho sakta hai: translated address jo doosri Locations ko use karna hota hai. <b>Location</b> ek label hai jo un elements ko group karta hai jo bina translation ek doosre tak pahunch sakte hain. Thumb rule: same Location ke components real control address use karte hain; alag Location ke components Location-specific contact address use karte hain agar ho, nahi to element ka default contact address, nahi to plain address. Jin engines ka IP badalta rehta hai ya jo NAT ke peeche hain, woh connection khud start kar sakte hain (node-initiated contact). Lab mein ek SMC Location aur ek engine Location hai aur contact timers simulate nahi hote.</p>

<div class="eg"><p><b>Worked example.</b> NK-PUNE-FW banao, eth0 10.0.0.1/24 control interface. SMC ek one-time password dikhata hai, maan lo <code>kX93-demo-otp</code> (invented). FW1 par chalao <code>sg-contact-mgmt 10.0.0.10 kX93-demo-otp</code>. Tool success report karta hai; Engines page Unknown se No Policy Installed ho jata hai. Aap Initial Policy chunte ho aur Install policy dabate ho. Kuch seconds baad status Online hai aur Monitoring mein node green dikhta hai.</p></div>

<pre class="code"><span class="c">! on the engine FW1 (engine command line)</span>
sg-contact-mgmt 10.0.0.10 kX93-demo-otp
<span class="c">! afterwards, check</span>
sg-status</pre>
<p>Reference configuration (not run in the simulator): real engine par <code>sg-status</code> aur <code>sg-version</code> node status aur software version dikhate hain; <code>sg-contact-mgmt</code> ki option list releases ke beech alag hoti hai, isliye apne NGFW version ki documentation check karo.</p>

<div class="warn"><p><b>Common mistakes.</b> Command mein galat SMC IP. One-time password galat type karna ya engine element dobara banane ke baad purana use karna. Engine element mein control IP galat, jisse SMC wapas reach nahi kar pata. Aisi policy install karna jo management contact drop kare. Yeh bhoolna ki SMC aur engine ke beech firewall rules (ya NAT) ko TCP 8902 allow karna hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Contact two-way hai. Initial contact trust banata hai, lekin Online ke liye policy bhi chahiye. "No Policy Installed" achha status hai: iska matlab contact kaam kiya.</p></div>

<div class="scn"><h4>Command success hua phir bhi Unknown</h4><p>MyPnetLab ke trainee ne sg-contact-mgmt successfully chalaya, lekin Engines page ab bhi Unknown dikha raha tha. Engine element check kiya to control IP 10.0.0.1 ke bajaye 10.0.0.11 type hua tha. Engine SMC se baat kar sakta tha, lekin SMC ek non-existent address par jawab dene ki koshish kar raha tha. Address sahi karke, naye one-time password ke saath contact dobara chalane par status No Policy Installed hua, aur install ke baad Online.</p><p><b>Lesson:</b> engine ka SMC tak pahunchna sirf aadha hai. SMC ko bhi engine tak pahunchna hai.</p></div>

<div class="iv"><p class="q">"Naye engine ko SMC management ke under kaise laate hain, step by step batao."</p><p>Strong answer: interfaces aur control interface ke saath engine element banao; initial configuration par SMC one-time password generate karta hai; engine par SMC address aur password ke saath sg-contact-mgmt chalao taki trust ban jaye; status Unknown se No Policy Installed hota hai; phir management contact allow karne wali policy install karo aur node Online ho jata hai. NAT beech mein ho to contact addresses aur Locations ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle engine element banao; SMC one-time password generate karta hai.</li>
<li>Engine par sg-contact-mgmt trust establish karta hai; password ek hi baar use hota hai.</li>
<li>Status flow: Unknown, phir No Policy Installed, phir Install policy ke baad Online.</li>
<li>Contact two-way hai: engine se SMC tcp 8902 par, SMC se engine control IP par.</li>
<li>Locations aur contact addresses SMC aur engine ke beech NAT ka solution hain.</li>
</ul></div>
`}};export{e as default};