var e={id:`lina-snort`,h:{en:`Inside Threat Defense: the LINA and Snort engines`,hi:`Threat Defense ke andar: LINA aur Snort engines`},body:{en:`
<p>Think of an airport. At the gate, officers check your boarding pass and passport: which flight, which terminal, are you on the list. That is quick and based on simple facts. Your bag goes through a separate X-ray room where specialists look <i>inside</i> it. Threat Defense has the same split. <b>LINA</b> is the gate officer; <b>Snort</b> is the X-ray room. Every connection passes the gate, and most also pass the X-ray before the final "yes, you may fly".</p>

<h3>One image, two engines</h3>
<p>Threat Defense is a single software image that runs on hardware appliances (for example the Secure Firewall 1200, 3100 and 4200 series) and as a virtual machine (FTDv) in private and public clouds. Inside the image there are two processing engines:</p>
<dl class="terms">
<dt>LINA</dt><dd>The ASA code, adapted. It owns interfaces, routing, ARP, <b>NAT</b>, the <b>connection table</b>, VPN termination, the prefilter and the Layer 3/4 part of your rules. Its show commands are the ones you know from the ASA: <code>show conn</code>, <code>show xlate</code>, <code>show nat</code>, <code>show route</code>, <code>packet-tracer</code>, <code>capture</code>, <code>show asp drop</code>.</dd>
<dt>Snort 3</dt><dd>The deep inspection engine, the default for new deployments since release 7.0. It identifies applications (<b>AppID</b>), applies Security Intelligence, decryption, user identity, URL filtering, the <b>intrusion policy</b> and the <b>file and malware policy</b>. It returns a <b>verdict</b> to LINA for every packet it sees: pass, block, or "trust this flow, no more inspection needed".</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Packet path through LINA and Snort">
<rect x="10" y="30" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="65" y="52" text-anchor="middle" class="svg-ink" font-size="13">Ingress</text><text x="65" y="69" text-anchor="middle" class="svg-muted" font-size="12">inside</text>
<rect x="150" y="20" width="200" height="90" rx="8" fill="#bae6fd"/><text x="250" y="42" text-anchor="middle" class="svg-ink" font-size="14">LINA</text><text x="250" y="62" text-anchor="middle" class="svg-muted" font-size="12">prefilter, route, UN-NAT</text><text x="250" y="80" text-anchor="middle" class="svg-muted" font-size="12">CSM_FW_ACL_ (L3/L4)</text><text x="250" y="98" text-anchor="middle" class="svg-muted" font-size="12">NAT, conn table</text>
<rect x="150" y="160" width="200" height="72" rx="8" fill="#ddd6fe"/><text x="250" y="182" text-anchor="middle" class="svg-ink" font-size="14">Snort 3</text><text x="250" y="202" text-anchor="middle" class="svg-muted" font-size="12">SI, decrypt, identity, AppID</text><text x="250" y="220" text-anchor="middle" class="svg-muted" font-size="12">L7 rules, IPS, file</text>
<line x1="120" y1="55" x2="150" y2="55" stroke="#64748b" stroke-width="2"/>
<line x1="220" y1="110" x2="220" y2="160" stroke="#64748b" stroke-width="2"/><text x="160" y="140" class="svg-accent" font-size="12">to Snort</text>
<line x1="280" y1="160" x2="280" y2="110" stroke="#64748b" stroke-width="2"/><text x="290" y="140" class="svg-accent" font-size="12">verdict</text>
<rect x="400" y="30" width="110" height="50" rx="8" fill="#fde68a"/><text x="455" y="52" text-anchor="middle" class="svg-ink" font-size="13">Egress</text><text x="455" y="69" text-anchor="middle" class="svg-muted" font-size="12">outside</text>
<line x1="350" y1="55" x2="400" y2="55" stroke="#64748b" stroke-width="2"/>
<text x="530" y="140" class="svg-muted" font-size="12">Fastpath: never</text><text x="530" y="156" class="svg-muted" font-size="12">goes to Snort</text>
</svg><p class="cap">LINA handles the gate checks and NAT; Snort inspects content and sends a verdict back; prefilter Fastpath skips Snort.</p></div>

<h3>Following one packet</h3>
<p>PC1 (10.0.1.10) opens a web page on 8.8.8.8. The first packet goes like this:</p>
<ol>
<li><b>Ingress and prefilter (LINA).</b> The prefilter policy can Fastpath, Block or Analyze. The default prefilter only says "analyze" for tunnels, so the packet continues.</li>
<li><b>Route lookup and UN-NAT (LINA).</b> Egress interface outside, next hop 203.0.113.1. For inbound traffic to a published server, the destination is untranslated here, before the policy check.</li>
<li><b>Access list CSM_FW_ACL_ (LINA).</b> The Management Center compiles your access control rules into this access list. Rules with only Layer 3/4 conditions can be decided right here; Allow rules hand the packet to Snort.</li>
<li><b>Snort.</b> Security Intelligence, application and URL matching, the rule's intrusion and file policies, then the verdict.</li>
<li><b>NAT and flow creation (LINA).</b> PAT to 203.0.113.2, a connection is built, and the next packets of the flow follow the fast path through the connection table, still visiting Snort unless the flow was trusted.</li>
</ol>

<p>You can watch this in <code>packet-tracer</code> on the lab device:</p>
<pre class="out">&gt; packet-tracer input inside tcp 10.0.1.10 40000 8.8.8.8 80
Phase: 2
Type: ACCESS-LIST
Subtype: log
Result: ALLOW
Config:
access-group CSM_FW_ACL_ global
access-list CSM_FW_ACL_ advanced permit tcp ifc inside any ifc outside any eq www rule-id 268435457
access-list CSM_FW_ACL_ remark rule-id 268435457: L7 RULE: Inside-Out
Additional Information:
<span class="hl">This packet will be sent to snort for additional processing where a verdict will be reached</span>

Phase: 3
Type: SNORT
Result: ALLOW
Additional Information:
Snort Trace:
Packet: matched rule Inside-Out
<span class="hl">Snort Verdict: (pass-packet) allow this packet</span></pre>

<p>Notice <code>access-group CSM_FW_ACL_ global</code>. There are no per-interface ACLs any more: one global access list, and the zones appear inside each line as <code>ifc inside</code> and <code>ifc outside</code>.</p>

<h3>Why the split matters to you</h3>
<ul>
<li><b>Troubleshooting.</b> A drop in LINA shows a drop reason (<code>acl-drop</code>, <code>nat-no-xlate</code>, <code>no-route</code>) in <code>packet-tracer</code> and <code>show asp drop</code>. A block in Snort shows as a SNORT phase verdict and as a connection event with a reason such as "Intrusion Block".</li>
<li><b>Performance.</b> Snort is where the CPU goes. Large trusted flows (backups, replication) can be Trusted or prefiltered with Fastpath so they skip deep inspection.</li>
<li><b>Change impact.</b> Some deployments restart Snort processes. The Management Center warns you with an <b>inspection interruption</b> flag before you deploy.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A rule "Block-Telnet" matches only zone INSIDE to OUTSIDE and TCP 23. It has no application, URL or user condition, so LINA can enforce it with a deny line in CSM_FW_ACL_, marked <code>L4 RULE</code> on a real device. A rule "Block-Facebook" matches an application, so LINA must permit the first packets to Snort, which identifies the application after a few packets and then blocks the flow. That is why a few packets of an application-blocked session can pass before the block: this is called <b>late match</b>.</p></div>

<div class="warn"><p><b>Common mistake.</b> Running <code>show access-list</code> and expecting to see interface ACL names like OUTSIDE_IN. On Threat Defense the only access list is CSM_FW_ACL_, and its line text depends on how the Management Center compiled your rules. Use <code>show access-control-config</code> to see the rules by name.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which engine performs NAT?" LINA. "Which engine identifies applications and runs the intrusion policy?" Snort. "Which prefilter action bypasses Snort completely?" Fastpath. Trust in the access control policy is not the same as Fastpath: Trust is decided after the early Snort checks and then skips further inspection.</p></div>

<div class="scn"><h4>The backup that ate the CPU</h4><p>Nightly backups of 4 TB between two data-centre subnets ran through an Allow rule with the Balanced Security and Connectivity intrusion policy. Snort CPU sat at 95 percent every night, and users on the same firewall complained about slow web browsing. The engineer confirmed with the security team that both subnets were trusted servers, then changed the backup rule to <b>Trust</b> (a prefilter Fastpath rule was the alternative). Snort load dropped to 30 percent.</p><p><b>Lesson:</b> deep inspection has a cost; skip it only for known, trusted, high-volume flows, and document why.</p></div>

<div class="iv"><p class="q">"What are LINA and Snort in Threat Defense?"</p><p>LINA is the ASA-derived data plane: interfaces, routing, NAT, the connection table, VPN, prefilter and Layer 3/4 access control. Snort 3 is the inspection engine: AppID, Security Intelligence, decryption, identity, URL, intrusion and file inspection; it returns a verdict per packet. Add that <code>packet-tracer</code> shows both: the ACCESS-LIST phase with the rule-id and a SNORT phase with the verdict.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LINA = ASA data plane: routing, NAT, connections, VPN, prefilter, L3/L4 policy.</li>
<li>Snort 3 = deep inspection: SI, decryption, identity, AppID, URL, IPS, file and malware.</li>
<li>All access control rules become one global access list, CSM_FW_ACL_.</li>
<li>packet-tracer shows the matched rule-id and the Snort verdict.</li>
<li>Prefilter Fastpath bypasses Snort; Trust skips further inspection after the rule is matched.</li>
</ul></div>
`,hi:`
<p>Ek airport socho. Gate par officers aapka boarding pass aur passport check karte hain: kaunsi flight, kaunsa terminal, kya aap list mein ho. Yeh jaldi hota hai aur simple facts par based hai. Aapka bag ek alag X-ray room se guzarta hai jahan specialists uske <i>andar</i> dekhte hain. Threat Defense mein bhi yahi batwara hai. <b>LINA</b> gate officer hai; <b>Snort</b> X-ray room hai. Har connection gate se guzarta hai, aur zyada tar final "haan, aap ud sakte ho" se pehle X-ray se bhi guzarte hain.</p>

<h3>Ek image, do engines</h3>
<p>Threat Defense ek single software image hai jo hardware appliances (jaise Secure Firewall 1200, 3100 aur 4200 series) par aur private aur public clouds mein virtual machine (FTDv) ki tarah chalti hai. Image ke andar do processing engines hain:</p>
<dl class="terms">
<dt>LINA</dt><dd>ASA code, adapt kiya hua. Iske paas interfaces, routing, ARP, <b>NAT</b>, <b>connection table</b>, VPN termination, prefilter aur aapki rules ka Layer 3/4 hissa hai. Iske show commands wahi hain jo aap ASA se jaante ho: <code>show conn</code>, <code>show xlate</code>, <code>show nat</code>, <code>show route</code>, <code>packet-tracer</code>, <code>capture</code>, <code>show asp drop</code>.</dd>
<dt>Snort 3</dt><dd>Deep inspection engine, release 7.0 se naye deployments ke liye default. Yeh applications identify karta hai (<b>AppID</b>), Security Intelligence, decryption, user identity, URL filtering, <b>intrusion policy</b> aur <b>file aur malware policy</b> apply karta hai. Har dekhe gaye packet ke liye yeh LINA ko ek <b>verdict</b> lautata hai: pass, block, ya "is flow par trust karo, aur inspection ki zaroorat nahi".</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Packet path through LINA and Snort">
<rect x="10" y="30" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="65" y="52" text-anchor="middle" class="svg-ink" font-size="13">Ingress</text><text x="65" y="69" text-anchor="middle" class="svg-muted" font-size="12">inside</text>
<rect x="150" y="20" width="200" height="90" rx="8" fill="#bae6fd"/><text x="250" y="42" text-anchor="middle" class="svg-ink" font-size="14">LINA</text><text x="250" y="62" text-anchor="middle" class="svg-muted" font-size="12">prefilter, route, UN-NAT</text><text x="250" y="80" text-anchor="middle" class="svg-muted" font-size="12">CSM_FW_ACL_ (L3/L4)</text><text x="250" y="98" text-anchor="middle" class="svg-muted" font-size="12">NAT, conn table</text>
<rect x="150" y="160" width="200" height="72" rx="8" fill="#ddd6fe"/><text x="250" y="182" text-anchor="middle" class="svg-ink" font-size="14">Snort 3</text><text x="250" y="202" text-anchor="middle" class="svg-muted" font-size="12">SI, decrypt, identity, AppID</text><text x="250" y="220" text-anchor="middle" class="svg-muted" font-size="12">L7 rules, IPS, file</text>
<line x1="120" y1="55" x2="150" y2="55" stroke="#64748b" stroke-width="2"/>
<line x1="220" y1="110" x2="220" y2="160" stroke="#64748b" stroke-width="2"/><text x="160" y="140" class="svg-accent" font-size="12">Snort ko</text>
<line x1="280" y1="160" x2="280" y2="110" stroke="#64748b" stroke-width="2"/><text x="290" y="140" class="svg-accent" font-size="12">verdict</text>
<rect x="400" y="30" width="110" height="50" rx="8" fill="#fde68a"/><text x="455" y="52" text-anchor="middle" class="svg-ink" font-size="13">Egress</text><text x="455" y="69" text-anchor="middle" class="svg-muted" font-size="12">outside</text>
<line x1="350" y1="55" x2="400" y2="55" stroke="#64748b" stroke-width="2"/>
<text x="530" y="140" class="svg-muted" font-size="12">Fastpath: kabhi</text><text x="530" y="156" class="svg-muted" font-size="12">Snort nahi jaata</text>
</svg><p class="cap">LINA gate checks aur NAT sambhalta hai; Snort content inspect karke verdict wapas bhejta hai; prefilter Fastpath Snort ko skip karta hai.</p></div>

<h3>Ek packet ka peecha karna</h3>
<p>PC1 (10.0.1.10) 8.8.8.8 par web page kholta hai. Pehla packet aise jaata hai:</p>
<ol>
<li><b>Ingress aur prefilter (LINA).</b> Prefilter policy Fastpath, Block ya Analyze kar sakti hai. Default prefilter sirf tunnels ke liye "analyze" kehta hai, isliye packet aage badhta hai.</li>
<li><b>Route lookup aur UN-NAT (LINA).</b> Egress interface outside, next hop 203.0.113.1. Published server ki taraf inbound traffic ke liye destination yahin untranslate hota hai, policy check se pehle.</li>
<li><b>Access list CSM_FW_ACL_ (LINA).</b> Management Center aapki access control rules ko is access list mein compile karta hai. Sirf Layer 3/4 conditions wali rules yahin decide ho sakti hain; Allow rules packet ko Snort ke haath saunpti hain.</li>
<li><b>Snort.</b> Security Intelligence, application aur URL matching, rule ki intrusion aur file policies, phir verdict.</li>
<li><b>NAT aur flow creation (LINA).</b> 203.0.113.2 par PAT, ek connection banta hai, aur flow ke agle packets connection table ke fast path se jaate hain, aur Snort ke paas bhi jaate rehte hain jab tak flow trusted na ho.</li>
</ol>

<p>Lab device par aap ise <code>packet-tracer</code> mein dekh sakte ho:</p>
<pre class="out">&gt; packet-tracer input inside tcp 10.0.1.10 40000 8.8.8.8 80
Phase: 2
Type: ACCESS-LIST
Subtype: log
Result: ALLOW
Config:
access-group CSM_FW_ACL_ global
access-list CSM_FW_ACL_ advanced permit tcp ifc inside any ifc outside any eq www rule-id 268435457
access-list CSM_FW_ACL_ remark rule-id 268435457: L7 RULE: Inside-Out
Additional Information:
<span class="hl">This packet will be sent to snort for additional processing where a verdict will be reached</span>

Phase: 3
Type: SNORT
Result: ALLOW
Additional Information:
Snort Trace:
Packet: matched rule Inside-Out
<span class="hl">Snort Verdict: (pass-packet) allow this packet</span></pre>

<p><code>access-group CSM_FW_ACL_ global</code> par dhyan do. Ab per-interface ACLs nahi hain: ek global access list, aur zones har line ke andar <code>ifc inside</code> aur <code>ifc outside</code> ke roop mein dikhte hain.</p>

<h3>Yeh batwara aapke liye kyun matter karta hai</h3>
<ul>
<li><b>Troubleshooting.</b> LINA mein drop <code>packet-tracer</code> aur <code>show asp drop</code> mein drop reason (<code>acl-drop</code>, <code>nat-no-xlate</code>, <code>no-route</code>) dikhata hai. Snort mein block SNORT phase verdict ke roop mein aur "Intrusion Block" jaise reason wale connection event ke roop mein dikhta hai.</li>
<li><b>Performance.</b> CPU Snort mein jaata hai. Bade trusted flows (backups, replication) ko Trust kiya ja sakta hai ya Fastpath ke saath prefilter kiya ja sakta hai taaki woh deep inspection skip karein.</li>
<li><b>Change impact.</b> Kuch deployments Snort processes restart karte hain. Deploy karne se pehle Management Center aapko <b>inspection interruption</b> flag se warn karta hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ek rule "Block-Telnet" sirf zone INSIDE se OUTSIDE aur TCP 23 match karti hai. Ismein koi application, URL ya user condition nahi, isliye LINA ise CSM_FW_ACL_ ki deny line se enforce kar sakta hai, jo real device par <code>L4 RULE</code> mark hoti hai. Ek rule "Block-Facebook" ek application match karti hai, isliye LINA ko pehle packets Snort tak permit karne padte hain, jo kuch packets ke baad application identify karke flow block karta hai. Isi wajah se application-blocked session ke kuch packets block se pehle pass ho sakte hain: ise <b>late match</b> kehte hain.</p></div>

<div class="warn"><p><b>Common galti.</b> <code>show access-list</code> chalana aur OUTSIDE_IN jaise interface ACL names dekhne ki ummeed karna. Threat Defense par sirf ek access list hai, CSM_FW_ACL_, aur uski line text is par depend karti hai ki Management Center ne aapki rules kaise compile ki. Rules ko naam se dekhne ke liye <code>show access-control-config</code> use karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> "NAT kaunsa engine karta hai?" LINA. "Applications kaunsa engine identify karta hai aur intrusion policy chalata hai?" Snort. "Kaunsa prefilter action Snort ko poori tarah bypass karta hai?" Fastpath. Access control policy ka Trust, Fastpath jaisa nahi hai: Trust shuruaati Snort checks ke baad decide hota hai aur phir aage ka inspection skip karta hai.</p></div>

<div class="scn"><h4>Woh backup jo CPU kha gaya</h4><p>Do data-centre subnets ke beech 4 TB ke nightly backups Balanced Security and Connectivity intrusion policy wali Allow rule se chal rahe the. Har raat Snort CPU 95 percent par rehta tha, aur usi firewall ke users slow web browsing ki shikayat karte the. Engineer ne security team se confirm kiya ki dono subnets trusted servers hain, phir backup rule ko <b>Trust</b> kar diya (prefilter Fastpath rule doosra vikalp tha). Snort load 30 percent par aa gaya.</p><p><b>Seekh:</b> deep inspection ki keemat hoti hai; ise sirf jaane-pehchaane, trusted, high-volume flows ke liye skip karo, aur wajah document karo.</p></div>

<div class="iv"><p class="q">"Threat Defense mein LINA aur Snort kya hain?"</p><p>LINA ASA se bana data plane hai: interfaces, routing, NAT, connection table, VPN, prefilter aur Layer 3/4 access control. Snort 3 inspection engine hai: AppID, Security Intelligence, decryption, identity, URL, intrusion aur file inspection; yeh har packet ke liye verdict lautata hai. Jodo ki <code>packet-tracer</code> dono dikhata hai: rule-id ke saath ACCESS-LIST phase aur verdict ke saath SNORT phase.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LINA = ASA data plane: routing, NAT, connections, VPN, prefilter, L3/L4 policy.</li>
<li>Snort 3 = deep inspection: SI, decryption, identity, AppID, URL, IPS, file aur malware.</li>
<li>Saari access control rules ek global access list, CSM_FW_ACL_, ban jaati hain.</li>
<li>packet-tracer matched rule-id aur Snort verdict dikhata hai.</li>
<li>Prefilter Fastpath Snort ko bypass karta hai; Trust rule match hone ke baad aage ka inspection skip karta hai.</li>
</ul></div>
`}};export{e as default};