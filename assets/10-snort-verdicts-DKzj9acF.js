var e={id:`snort-verdicts`,h:{en:`When Snort says no: Security Intelligence and intrusion verdicts`,hi:`Jab Snort mana kare: Security Intelligence aur intrusion verdicts`},body:{en:`
<p>A Next-Generation Firewall is supposed to block things. So when it blocks something a user needs, the troubleshooting question is not only "how do I let it through?" but first "was the firewall right?". This chapter teaches you to recognise the two Snort features that most often stop legitimate-looking traffic, <b>Security Intelligence</b> (SI) and the <b>intrusion policy</b>, to prove which one acted, and to fix it narrowly without switching security off. The next module, <i>NGFW policies</i>, teaches how to build these policies; here we only troubleshoot them.</p>

<h3>Security Intelligence: the reputation list at the door</h3>
<p>SI checks the IP address, URL or DNS name of a connection against <b>block lists</b>: Cisco Talos feeds of known bad addresses and domains, plus your own lists and feeds. It runs early in Snort, before the access control rules. Each list can be set to <b>Block</b> or <b>Monitor-only</b>. A <b>Do-Not-Block list</b> overrides the block lists for entries you have verified as safe. The DNS policy can block or sinkhole lookups for bad domains.</p>
<p>How you recognise an SI block:</p>
<ul>
<li>Connection event with <b>Reason: IP Block</b>, <b>URL Block</b> or <b>DNS Block</b>, and a Security Intelligence Category (for example a malware or botnet category, or your custom list).</li>
<li>An entry in Analysis → Connections → <b>Security-Related Events</b>.</li>
<li>firewall-engine-debug shows a line such as <code>Firewall: SI: blocklisted IP, block</code>; packet-tracer or trace shows a Snort verdict of <b>BLOCKLIST</b>.</li>
<li><code>show snort statistics</code>: Blacklisted Flows increase while you reproduce.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Order of Snort decisions">
<rect x="10" y="70" width="140" height="60" rx="8" fill="#fed7aa"/><text x="80" y="96" text-anchor="middle" class="svg-ink" font-size="13">1 Security</text><text x="80" y="114" text-anchor="middle" class="svg-ink" font-size="13">Intelligence</text>
<rect x="170" y="70" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="240" y="96" text-anchor="middle" class="svg-ink" font-size="13">2 Access</text><text x="240" y="114" text-anchor="middle" class="svg-ink" font-size="13">control rule</text>
<rect x="330" y="70" width="140" height="60" rx="8" fill="#bae6fd"/><text x="400" y="96" text-anchor="middle" class="svg-ink" font-size="13">3 Intrusion</text><text x="400" y="114" text-anchor="middle" class="svg-ink" font-size="13">policy</text>
<rect x="490" y="70" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="560" y="96" text-anchor="middle" class="svg-ink" font-size="13">4 File and</text><text x="560" y="114" text-anchor="middle" class="svg-ink" font-size="13">malware</text>
<line x1="150" y1="100" x2="170" y2="100" stroke="#64748b" stroke-width="2"/><line x1="310" y1="100" x2="330" y2="100" stroke="#64748b" stroke-width="2"/><line x1="470" y1="100" x2="490" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="80" y="160" text-anchor="middle" class="svg-muted" font-size="12">IP / URL / DNS Block</text><text x="240" y="160" text-anchor="middle" class="svg-muted" font-size="12">rule name, blank reason</text><text x="400" y="160" text-anchor="middle" class="svg-muted" font-size="12">Intrusion Block</text><text x="560" y="160" text-anchor="middle" class="svg-muted" font-size="12">File Block</text>
</svg><p class="cap">The Reason in the connection event tells you which stage stopped the flow.</p></div>

<h3>Intrusion policy: the inspector who reads the content</h3>
<p>For flows allowed by an access control rule with an intrusion policy attached, Snort compares the traffic with intrusion rules. Each rule is identified by <b>GID:SID</b> and has an action such as Alert, Block or Disable. If the rule action is Block and the interface is inline, the packet is dropped and the connection usually ends. Intrusion events (Analysis → Intrusions → Events, or Unified Events) show:</p>
<pre class="out">Message          nk-sim SQL injection attempt in login form
<span class="hl">GID:SID          1:1000101</span>
Priority         high
<span class="hl">Inline Result    Dropped</span>
Source IP        198.51.100.10
Destination IP   10.0.2.10
Destination Port 443 / tcp
Access Control Rule  Portal-In
Intrusion Policy     NK-Web-IPS</pre>
<p><b>Inline Result</b> is the key field. <b>Dropped</b> means Snort blocked it. <b>Would have dropped</b> means the rule matched but the policy is not allowed to drop (for example the interface is passive or "Drop when Inline" is off), so traffic passed. Open the <b>packet view</b> to see the payload that triggered the rule.</p>

<h3>The defensive fix process</h3>
<ol>
<li><b>Prove the layer.</b> Reason (IP Block versus Intrusion Block), Security-Related or intrusion event, trace verdict.</li>
<li><b>Decide true or false positive</b> with the application owner and the security team. A real attack is not a ticket to "fix"; it is an incident to escalate.</li>
<li><b>Fix as narrowly as possible.</b> For SI: add only the verified entry to the Do-Not-Block list, with a ticket reference and a review date. For intrusion: change that one rule's action, or apply a suppression or threshold limited to the specific source or destination, in the policy used for that traffic.</li>
<li><b>Never</b> switch the whole intrusion policy off, change the rule to Trust, or disable SI globally to make one ticket go away.</li>
<li><b>Deploy and verify</b> with events, and document why the exception exists.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> After a portal update, partners cannot submit a long form. Unified Events show Intrusion Block on Portal-In for GID:SID 1:1000101, Inline Result Dropped. The packet view shows a field containing SQL keywords because the new form lets partners paste report text. The application team confirms it is legitimate; the security team agrees. The engineer sets an exception for that SID only for destination 10.0.2.10, deploys, and asks the app team to add server-side validation. Every other rule still protects the portal.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Moving a flow to a Trust rule because of one intrusion event, which removes all inspection. Assuming "Would have dropped" means the traffic was blocked. Adding a whole /16 to the Do-Not-Block list for one website. Forgetting to deploy after editing the intrusion policy or SI lists.</p></div>

<div class="exam"><p><b>Exam trap.</b> SI is evaluated before access control rules, so an SI block wins even if an Allow rule would match. Reason IP Block = SI; Intrusion Block = intrusion policy. Inline Result Dropped versus Would have dropped. The Do-Not-Block list overrides the block list.</p></div>

<div class="scn"><h4>The payment gateway on a bad neighbourhood</h4><p>Checkout failed for one payment provider. Connection events showed Reason IP Block, category malware, for the provider's address. The provider used shared cloud hosting, and another tenant on the same address had been reported. The security team checked the provider with its own threat intelligence, found it clean, and approved a single /32 Do-Not-Block entry with a 30-day review. The provider was also asked to move to a dedicated address.</p><p><b>Lesson:</b> SI blocks can be collateral damage; fix with the narrowest exception and a review date, never by turning SI off.</p></div>

<div class="iv"><p class="q">"An intrusion rule is blocking a business application. How do you handle it?"</p><p>Confirm from the intrusion event: GID:SID, Inline Result Dropped, the access control rule and intrusion policy, and the packet view. Work with the app owner and security team to decide whether it is a false positive. If it is, tune narrowly: change or suppress that SID only for the affected hosts, deploy and verify. If it is a true positive, escalate as a security incident. Never Trust the flow or disable the policy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SI blocks by IP, URL or DNS reputation before access control rules; look for Reason IP/URL/DNS Block.</li>
<li>Intrusion blocks show Reason Intrusion Block and an intrusion event with GID:SID and Inline Result.</li>
<li>"Dropped" blocked the traffic; "Would have dropped" did not.</li>
<li>Decide true or false positive first; fix with the narrowest exception and document it.</li>
<li>Never disable SI, the intrusion policy, or use Trust to close a ticket.</li>
</ul></div>
`,hi:`
<p>Next-Generation Firewall ka kaam hi cheezein block karna hai. To jab woh koi aisi cheez block kare jo user ko chahiye, troubleshooting ka sawaal sirf "ise kaise jaane doon?" nahi hai, balki pehle "kya firewall sahi tha?". Yeh chapter aapko un do Snort features ko pehchaanna sikhata hai jo sabse zyada legitimate dikhne wala traffic rokte hain, <b>Security Intelligence</b> (SI) aur <b>intrusion policy</b>, yeh prove karna ki kisne action liya, aur security band kiye bina use narrowly theek karna. Agla module, <i>NGFW policies</i>, sikhata hai ki yeh policies kaise banti hain; yahan hum sirf unhe troubleshoot karte hain.</p>

<h3>Security Intelligence: darwaze par reputation list</h3>
<p>SI connection ke IP address, URL ya DNS name ko <b>block lists</b> se match karta hai: known bad addresses aur domains ke Cisco Talos feeds, plus aapki apni lists aur feeds. Yeh Snort mein jaldi, access control rules se pehle chalta hai. Har list <b>Block</b> ya <b>Monitor-only</b> set ho sakti hai. <b>Do-Not-Block list</b> un entries ke liye block lists ko override karti hai jinhe aapne safe verify kiya hai. DNS policy bad domains ke lookups block ya sinkhole kar sakti hai.</p>
<p>SI block kaise pehchaano:</p>
<ul>
<li>Connection event jismein <b>Reason: IP Block</b>, <b>URL Block</b> ya <b>DNS Block</b> ho, aur ek Security Intelligence Category (jaise malware ya botnet category, ya aapki custom list).</li>
<li>Analysis → Connections → <b>Security-Related Events</b> mein ek entry.</li>
<li>firewall-engine-debug <code>Firewall: SI: blocklisted IP, block</code> jaisi line dikhata hai; packet-tracer ya trace Snort verdict <b>BLOCKLIST</b> dikhata hai.</li>
<li><code>show snort statistics</code>: reproduce karte waqt Blacklisted Flows badhte hain.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Snort decisions ka order">
<rect x="10" y="70" width="140" height="60" rx="8" fill="#fed7aa"/><text x="80" y="96" text-anchor="middle" class="svg-ink" font-size="13">1 Security</text><text x="80" y="114" text-anchor="middle" class="svg-ink" font-size="13">Intelligence</text>
<rect x="170" y="70" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="240" y="96" text-anchor="middle" class="svg-ink" font-size="13">2 Access</text><text x="240" y="114" text-anchor="middle" class="svg-ink" font-size="13">control rule</text>
<rect x="330" y="70" width="140" height="60" rx="8" fill="#bae6fd"/><text x="400" y="96" text-anchor="middle" class="svg-ink" font-size="13">3 Intrusion</text><text x="400" y="114" text-anchor="middle" class="svg-ink" font-size="13">policy</text>
<rect x="490" y="70" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="560" y="96" text-anchor="middle" class="svg-ink" font-size="13">4 File aur</text><text x="560" y="114" text-anchor="middle" class="svg-ink" font-size="13">malware</text>
<line x1="150" y1="100" x2="170" y2="100" stroke="#64748b" stroke-width="2"/><line x1="310" y1="100" x2="330" y2="100" stroke="#64748b" stroke-width="2"/><line x1="470" y1="100" x2="490" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="80" y="160" text-anchor="middle" class="svg-muted" font-size="12">IP / URL / DNS Block</text><text x="240" y="160" text-anchor="middle" class="svg-muted" font-size="12">rule name, khali reason</text><text x="400" y="160" text-anchor="middle" class="svg-muted" font-size="12">Intrusion Block</text><text x="560" y="160" text-anchor="middle" class="svg-muted" font-size="12">File Block</text>
</svg><p class="cap">Connection event ka Reason batata hai ki kis stage ne flow roka.</p></div>

<h3>Intrusion policy: woh inspector jo content padhta hai</h3>
<p>Jin flows ko intrusion policy attached access control rule allow karti hai, unke liye Snort traffic ko intrusion rules se compare karta hai. Har rule <b>GID:SID</b> se pehchaani jaati hai aur uska Alert, Block ya Disable jaisa action hota hai. Agar rule action Block hai aur interface inline hai, to packet drop hota hai aur connection aam taur par khatam ho jaata hai. Intrusion events (Analysis → Intrusions → Events, ya Unified Events) dikhate hain:</p>
<pre class="out">Message          nk-sim SQL injection attempt in login form
<span class="hl">GID:SID          1:1000101</span>
Priority         high
<span class="hl">Inline Result    Dropped</span>
Source IP        198.51.100.10
Destination IP   10.0.2.10
Destination Port 443 / tcp
Access Control Rule  Portal-In
Intrusion Policy     NK-Web-IPS</pre>
<p><b>Inline Result</b> key field hai. <b>Dropped</b> matlab Snort ne block kiya. <b>Would have dropped</b> matlab rule match hui par policy ko drop karne ki ijaazat nahi (jaise interface passive hai ya "Drop when Inline" off hai), to traffic pass hua. Rule trigger karne wala payload dekhne ke liye <b>packet view</b> kholo.</p>

<h3>Defensive fix process</h3>
<ol>
<li><b>Layer prove karo.</b> Reason (IP Block vs Intrusion Block), Security-Related ya intrusion event, trace verdict.</li>
<li>Application owner aur security team ke saath <b>true ya false positive decide karo</b>. Asli attack "fix" karne ka ticket nahi hai; woh escalate karne wala incident hai.</li>
<li><b>Jitna ho sake utna narrowly fix karo.</b> SI ke liye: sirf verified entry ko ticket reference aur review date ke saath Do-Not-Block list mein jodo. Intrusion ke liye: us traffic ke liye use hone wali policy mein sirf us ek rule ka action badlo, ya specific source ya destination tak limited suppression ya threshold lagao.</li>
<li>Ek ticket hatane ke liye <b>kabhi</b> poori intrusion policy off mat karo, rule ko Trust mat karo, ya SI globally disable mat karo.</li>
<li><b>Deploy aur verify</b> events se karo, aur document karo ki exception kyun hai.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Portal update ke baad partners ek lamba form submit nahi kar paate. Unified Events Portal-In par GID:SID 1:1000101 ke liye Intrusion Block, Inline Result Dropped dikhate hain. Packet view mein ek field SQL keywords ke saath dikhta hai kyunki naya form partners ko report text paste karne deta hai. Application team confirm karti hai ki yeh legitimate hai; security team agree karti hai. Engineer sirf destination 10.0.2.10 ke liye sirf us SID ka exception set karta hai, deploy karta hai, aur app team ko server-side validation jodne ko kehta hai. Baaki har rule ab bhi portal ko bachati hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Ek intrusion event ki wajah se flow ko Trust rule par le jaana, jo saara inspection hata deta hai. Yeh maanna ki "Would have dropped" ka matlab traffic block hua. Ek website ke liye poora /16 Do-Not-Block list mein jodna. Intrusion policy ya SI lists edit karne ke baad deploy karna bhoolna.</p></div>

<div class="exam"><p><b>Exam trap.</b> SI access control rules se pehle evaluate hota hai, isliye SI block jeetta hai chahe Allow rule match karti. Reason IP Block = SI; Intrusion Block = intrusion policy. Inline Result Dropped vs Would have dropped. Do-Not-Block list block list ko override karti hai.</p></div>

<div class="scn"><h4>Kharaab mohalle mein payment gateway</h4><p>Ek payment provider ke liye checkout fail hua. Connection events ne provider ke address ke liye Reason IP Block, category malware dikhaya. Provider shared cloud hosting use karta tha, aur usi address ke ek doosre tenant ko report kiya gaya tha. Security team ne provider ko apni threat intelligence se check kiya, clean paaya, aur 30-din ke review ke saath ek single /32 Do-Not-Block entry approve ki. Provider se dedicated address par jaane ko bhi kaha gaya.</p><p><b>Seekh:</b> SI blocks collateral damage ho sakte hain; sabse narrow exception aur review date ke saath fix karo, SI band karke kabhi nahi.</p></div>

<div class="iv"><p class="q">"Ek intrusion rule business application block kar rahi hai. Aap ise kaise handle karoge?"</p><p>Intrusion event se confirm karo: GID:SID, Inline Result Dropped, access control rule aur intrusion policy, aur packet view. App owner aur security team ke saath decide karo ki yeh false positive hai ya nahi. Agar hai, to narrowly tune karo: sirf affected hosts ke liye sirf woh SID change ya suppress karo, deploy aur verify karo. Agar true positive hai, to security incident ke roop mein escalate karo. Flow ko kabhi Trust mat karo ya policy disable mat karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SI access control rules se pehle IP, URL ya DNS reputation se block karta hai; Reason IP/URL/DNS Block dekho.</li>
<li>Intrusion blocks Reason Intrusion Block aur GID:SID aur Inline Result wala intrusion event dikhate hain.</li>
<li>"Dropped" ne traffic block kiya; "Would have dropped" ne nahi.</li>
<li>Pehle true ya false positive decide karo; sabse narrow exception se fix karo aur document karo.</li>
<li>Ticket band karne ke liye SI, intrusion policy kabhi disable mat karo, na Trust use karo.</li>
</ul></div>
`}};export{e as default};