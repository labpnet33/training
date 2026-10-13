var e={id:`policy-order`,h:{en:`The access control policy and its order of operations`,hi:`Access control policy aur uska order of operations`},body:{en:`
<p>Entering a cricket stadium is a sequence of checks, always in the same order. Staff and team buses use a separate lane and skip the queue. Sealed bags are opened so the guards can see inside. Everyone is compared with the banned list at the gate. Your ticket and ID are checked against your seat. Only then does the rulebook decide which stand you may enter, and if your situation is not in the rulebook, the default answer applies. A Threat Defense access control policy is that sequence, and knowing the order is half of every troubleshooting session.</p>

<h3>The sequence</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Access control order of operations">
<rect x="5" y="30" width="96" height="70" rx="8" fill="#bae6fd"/><text x="53" y="58" text-anchor="middle" class="svg-ink" font-size="13">1 Prefilter</text><text x="53" y="78" text-anchor="middle" class="svg-muted" font-size="12">LINA, L3/L4</text>
<rect x="110" y="30" width="96" height="70" rx="8" fill="#ddd6fe"/><text x="158" y="58" text-anchor="middle" class="svg-ink" font-size="13">2 Decryption</text><text x="158" y="78" text-anchor="middle" class="svg-muted" font-size="12">SSL policy</text>
<rect x="215" y="30" width="96" height="70" rx="8" fill="#fed7aa"/><text x="263" y="58" text-anchor="middle" class="svg-ink" font-size="13">3 Security</text><text x="263" y="76" text-anchor="middle" class="svg-ink" font-size="13">Intelligence</text>
<rect x="320" y="30" width="96" height="70" rx="8" fill="#bbf7d0"/><text x="368" y="58" text-anchor="middle" class="svg-ink" font-size="13">4 Identity</text><text x="368" y="78" text-anchor="middle" class="svg-muted" font-size="12">users</text>
<rect x="425" y="30" width="96" height="70" rx="8" fill="#fde68a"/><text x="473" y="58" text-anchor="middle" class="svg-ink" font-size="13">5 ACP rules</text><text x="473" y="78" text-anchor="middle" class="svg-muted" font-size="12">first match</text>
<rect x="530" y="30" width="105" height="70" rx="8" fill="#e2e8f0"/><text x="582" y="58" text-anchor="middle" class="svg-ink" font-size="13">6 Default</text><text x="582" y="78" text-anchor="middle" class="svg-muted" font-size="12">action</text>
<line x1="101" y1="65" x2="110" y2="65" stroke="#64748b" stroke-width="2"/><line x1="206" y1="65" x2="215" y2="65" stroke="#64748b" stroke-width="2"/><line x1="311" y1="65" x2="320" y2="65" stroke="#64748b" stroke-width="2"/><line x1="416" y1="65" x2="425" y2="65" stroke="#64748b" stroke-width="2"/><line x1="521" y1="65" x2="530" y2="65" stroke="#64748b" stroke-width="2"/>
<text x="53" y="130" text-anchor="middle" class="svg-accent" font-size="12">Fastpath skips</text><text x="53" y="146" text-anchor="middle" class="svg-accent" font-size="12">everything after</text>
<text x="473" y="130" text-anchor="middle" class="svg-accent" font-size="12">Allow rules add</text><text x="473" y="146" text-anchor="middle" class="svg-accent" font-size="12">IPS and file policy</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Steps 2 to 6 run in Snort; the L3/L4 parts are compiled into CSM_FW_ACL_ in LINA</text>
</svg><p class="cap">The order of operations of the access control policy and the policies attached to it.</p></div>

<dl class="terms">
<dt>1. Prefilter policy</dt><dd>Fast, early, LINA-only decisions based on Layer 3/4 (and tunnel) headers. Actions: <b>Fastpath</b> (skip Snort completely), <b>Analyze</b> (continue to the access control policy), <b>Block</b>. Tunnel rules handle encapsulated traffic such as GRE and IP-in-IP. The built-in <i>Default Prefilter Policy</i> analyzes everything; you see its trace on every device as <code>rule-id 9998: PREFILTER POLICY: Default Tunnel and Priority Policy</code>.</dd>
<dt>2. Decryption (SSL) policy</dt><dd>Decides whether TLS sessions are decrypted (Decrypt - Resign for outbound users, Decrypt - Known Key for your own servers), left encrypted (Do not decrypt) or blocked. Without decryption, Snort sees only metadata such as the server name, not the content.</dd>
<dt>3. Security Intelligence</dt><dd>Reputation-based blocking of known-bad IP addresses, URLs and domains (the DNS policy), fed by Cisco Talos feeds and your own lists, with a Do Not Block list for exceptions. Address-based intelligence can act on the very first packet, before any rule is evaluated.</dd>
<dt>4. Identity policy</dt><dd>Maps IP addresses to users and groups (Active Directory realms, ISE and passive identity, or an active captive portal), so rules can match "Finance group" instead of a subnet.</dd>
<dt>5. Access control rules</dt><dd>Evaluated <b>top-down, first match wins</b>. A rule matches when all its condition types match (zones AND networks AND ports AND applications...); within one condition type any value matches (HTTP OR HTTPS).</dd>
<dt>6. Default action</dt><dd>What happens to traffic that matched no rule: <b>Access Control: Block All Traffic</b>, <b>Trust All Traffic</b>, <b>Network Discovery Only</b>, or <b>Intrusion Prevention</b> with a chosen intrusion policy (allow and inspect).</dd>
</dl>
<p>The intrusion policy and the file and malware policy are not separate steps; they are attached to Allow rules (and to an Intrusion Prevention default action) and inspect what those rules permit. Their full depth comes in the NGFW policies module.</p>

<h3>Sections, categories and inheritance</h3>
<p>Rules live in two sections. The <b>Mandatory</b> section is evaluated first; the <b>Default</b> section comes after it. Inside them you can create categories (for example "Admin access", "Internet"). With policy inheritance, a <b>base policy</b> owned by the head office can force mandatory rules above, and default rules below, the rules of each child policy. This is how one security team enforces company-wide rules while branch teams manage their own middle part.</p>

<h3>In the lab GUI</h3>
<p><b>Policies → Access Control</b> shows the policy <b>NK-ACP</b> as a table: #, Name, Source and Destination Zones, Source and Destination Networks, Applications, URLs, Dest Ports, Action, Inspection, Log. The last row is always <b>Default Action</b>, shown as <i>Access Control: Block All Traffic</i>. Buttons: Add Rule, Edit, Delete, Move Up, Move Down, Default Action. On a real Management Center: <b>Policies → Access Control</b>, then edit the policy; prefilter, decryption and identity policies are linked from the policy header and the Advanced tab.</p>

<pre class="out">&gt; show running-config access-list
<span class="hl">access-list CSM_FW_ACL_ remark rule-id 9998: PREFILTER POLICY: Default Tunnel and Priority Policy</span>
access-list CSM_FW_ACL_ advanced permit ipinip any any rule-id 9998
access-list CSM_FW_ACL_ remark rule-id 268435457: ACCESS POLICY: NK-ACP - Mandatory
access-list CSM_FW_ACL_ remark rule-id 268435457: L7 RULE: Inside-Out
access-list CSM_FW_ACL_ advanced permit tcp ifc inside any ifc outside any eq www rule-id 268435457
access-list CSM_FW_ACL_ remark rule-id 268434432: ACCESS POLICY: NK-ACP - Default
access-list CSM_FW_ACL_ remark rule-id 268434432: L4 RULE: DEFAULT ACTION RULE
<span class="hl">access-list CSM_FW_ACL_ advanced deny ip any any rule-id 268434432</span></pre>
<p>Read it top to bottom and you see the order: prefilter (9998) first, your rules in the middle, the default action (always rule-id <b>268434432</b>) last.</p>

<div class="eg"><p><b>Worked example.</b> PC1 opens a site whose IP address is on the Security Intelligence block list, and rule 1 Inside-Out allows HTTPS. Result: blocked, because Security Intelligence runs before the access control rules. The connection event shows reason <i>IP Block</i>. To allow it, the address goes on the Do Not Block list, not into a new rule.</p></div>

<div class="warn"><p><b>Common mistake.</b> Putting a broad Allow rule high in the Mandatory section of a base policy. Every child policy inherits it above its own rules, so no branch can block that traffic any more.</p></div>

<div class="exam"><p><b>Exam trap.</b> Know the order: prefilter, decryption, Security Intelligence, identity, access control rules, default action. Prefilter Fastpath bypasses all Snort-based steps. Rule-id 268434432 is the default action; 9998 is the default prefilter tunnel rule.</p></div>

<div class="scn"><h4>The rule that could never win</h4><p>A partner subnet was allowed to reach an SFTP server by rule 14. Connection events showed Block with reason <i>IP Block</i>, not a rule name. The partner's address had appeared in a reputation feed after another tenant of their cloud provider misbehaved. The team confirmed the address belonged to the partner, added it to the Do Not Block list, deployed, and SFTP worked.</p><p><b>Lesson:</b> if the event reason is Security Intelligence, rule order is irrelevant; fix it where SI is configured.</p></div>

<div class="iv"><p class="q">"In what order does Threat Defense process a new connection?"</p><p>Prefilter in LINA (Fastpath, Analyze, Block), then in Snort: decryption policy, Security Intelligence, identity, access control rules top-down with first match, and the default action. Allow rules attach intrusion and file policies. Mention that address-based Security Intelligence can block on the first packet, and that the default action has rule-id 268434432.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: prefilter, decryption, Security Intelligence, identity, access control rules, default action.</li>
<li>Rules are evaluated top-down; the first match wins; AND between condition types, OR within one.</li>
<li>Mandatory section before Default section; base policies can force rules on children.</li>
<li>Default action choices: Block All, Trust All, Network Discovery Only, Intrusion Prevention.</li>
<li>Lab path: Policies → Access Control; the Default Action row is always last.</li>
</ul></div>
`,hi:`
<p>Cricket stadium mein ghusna checks ka ek sequence hai, hamesha same order mein. Staff aur team buses alag lane use karti hain aur queue skip karti hain. Sealed bags khole jaate hain taaki guards andar dekh sakein. Gate par har kisi ko banned list se milaya jaata hai. Aapka ticket aur ID aapki seat se check hota hai. Tab jaakar rulebook decide karti hai ki aap kaunse stand mein ja sakte ho, aur agar aapki situation rulebook mein nahi hai, to default jawab lagta hai. Threat Defense access control policy yahi sequence hai, aur order jaanna har troubleshooting session ka aadha kaam hai.</p>

<h3>Sequence</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Access control order of operations">
<rect x="5" y="30" width="96" height="70" rx="8" fill="#bae6fd"/><text x="53" y="58" text-anchor="middle" class="svg-ink" font-size="13">1 Prefilter</text><text x="53" y="78" text-anchor="middle" class="svg-muted" font-size="12">LINA, L3/L4</text>
<rect x="110" y="30" width="96" height="70" rx="8" fill="#ddd6fe"/><text x="158" y="58" text-anchor="middle" class="svg-ink" font-size="13">2 Decryption</text><text x="158" y="78" text-anchor="middle" class="svg-muted" font-size="12">SSL policy</text>
<rect x="215" y="30" width="96" height="70" rx="8" fill="#fed7aa"/><text x="263" y="58" text-anchor="middle" class="svg-ink" font-size="13">3 Security</text><text x="263" y="76" text-anchor="middle" class="svg-ink" font-size="13">Intelligence</text>
<rect x="320" y="30" width="96" height="70" rx="8" fill="#bbf7d0"/><text x="368" y="58" text-anchor="middle" class="svg-ink" font-size="13">4 Identity</text><text x="368" y="78" text-anchor="middle" class="svg-muted" font-size="12">users</text>
<rect x="425" y="30" width="96" height="70" rx="8" fill="#fde68a"/><text x="473" y="58" text-anchor="middle" class="svg-ink" font-size="13">5 ACP rules</text><text x="473" y="78" text-anchor="middle" class="svg-muted" font-size="12">pehla match</text>
<rect x="530" y="30" width="105" height="70" rx="8" fill="#e2e8f0"/><text x="582" y="58" text-anchor="middle" class="svg-ink" font-size="13">6 Default</text><text x="582" y="78" text-anchor="middle" class="svg-muted" font-size="12">action</text>
<line x1="101" y1="65" x2="110" y2="65" stroke="#64748b" stroke-width="2"/><line x1="206" y1="65" x2="215" y2="65" stroke="#64748b" stroke-width="2"/><line x1="311" y1="65" x2="320" y2="65" stroke="#64748b" stroke-width="2"/><line x1="416" y1="65" x2="425" y2="65" stroke="#64748b" stroke-width="2"/><line x1="521" y1="65" x2="530" y2="65" stroke="#64748b" stroke-width="2"/>
<text x="53" y="130" text-anchor="middle" class="svg-accent" font-size="12">Fastpath baad ka</text><text x="53" y="146" text-anchor="middle" class="svg-accent" font-size="12">sab skip karta hai</text>
<text x="473" y="130" text-anchor="middle" class="svg-accent" font-size="12">Allow rules IPS aur</text><text x="473" y="146" text-anchor="middle" class="svg-accent" font-size="12">file policy jodti hain</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Steps 2 se 6 Snort mein chalte hain; L3/L4 hisse LINA ke CSM_FW_ACL_ mein compile hote hain</text>
</svg><p class="cap">Access control policy aur usse judi policies ka order of operations.</p></div>

<dl class="terms">
<dt>1. Prefilter policy</dt><dd>Layer 3/4 (aur tunnel) headers par based tez, shuruaati, sirf-LINA decisions. Actions: <b>Fastpath</b> (Snort ko poori tarah skip), <b>Analyze</b> (access control policy tak jaari raho), <b>Block</b>. Tunnel rules GRE aur IP-in-IP jaise encapsulated traffic ko sambhalti hain. Built-in <i>Default Prefilter Policy</i> sab kuch analyze karti hai; aapko har device par iska trace <code>rule-id 9998: PREFILTER POLICY: Default Tunnel and Priority Policy</code> ke roop mein dikhta hai.</dd>
<dt>2. Decryption (SSL) policy</dt><dd>Decide karti hai ki TLS sessions decrypt hon (outbound users ke liye Decrypt - Resign, apne servers ke liye Decrypt - Known Key), encrypted chhode jayein (Do not decrypt) ya block hon. Decryption ke bina Snort sirf server name jaisa metadata dekhta hai, content nahi.</dd>
<dt>3. Security Intelligence</dt><dd>Jaane-maane kharab IP addresses, URLs aur domains (DNS policy) ki reputation-based blocking, Cisco Talos feeds aur aapki apni lists se, exceptions ke liye Do Not Block list ke saath. Address-based intelligence bilkul pehle packet par, kisi bhi rule ke evaluate hone se pehle, kaam kar sakti hai.</dd>
<dt>4. Identity policy</dt><dd>IP addresses ko users aur groups se map karti hai (Active Directory realms, ISE aur passive identity, ya active captive portal), taaki rules subnet ki jagah "Finance group" match kar sakein.</dd>
<dt>5. Access control rules</dt><dd><b>Upar se neeche evaluate hoti hain, pehla match jeetta hai</b>. Rule tab match hoti hai jab uske saare condition types match hon (zones AND networks AND ports AND applications...); ek condition type ke andar koi bhi value match karti hai (HTTP OR HTTPS).</dd>
<dt>6. Default action</dt><dd>Kisi rule se match na hone wale traffic ka kya hota hai: <b>Access Control: Block All Traffic</b>, <b>Trust All Traffic</b>, <b>Network Discovery Only</b>, ya chuni hui intrusion policy ke saath <b>Intrusion Prevention</b> (allow aur inspect).</dd>
</dl>
<p>Intrusion policy aur file aur malware policy alag steps nahi hain; woh Allow rules (aur Intrusion Prevention default action) se judi hoti hain aur un rules ke permit kiye traffic ko inspect karti hain. Unki poori depth NGFW policies module mein aati hai.</p>

<h3>Sections, categories aur inheritance</h3>
<p>Rules do sections mein rehti hain. <b>Mandatory</b> section pehle evaluate hota hai; <b>Default</b> section uske baad aata hai. Unke andar aap categories bana sakte ho (jaise "Admin access", "Internet"). Policy inheritance ke saath, head office ki ek <b>base policy</b> har child policy ki rules ke upar mandatory rules, aur neeche default rules force kar sakti hai. Isi tarah ek security team company-wide rules enforce karti hai jabki branch teams apna beech ka hissa manage karti hain.</p>

<h3>Lab GUI mein</h3>
<p><b>Policies → Access Control</b> policy <b>NK-ACP</b> ko table ki tarah dikhata hai: #, Name, Source aur Destination Zones, Source aur Destination Networks, Applications, URLs, Dest Ports, Action, Inspection, Log. Aakhri row hamesha <b>Default Action</b> hoti hai, <i>Access Control: Block All Traffic</i> ke roop mein dikhti hai. Buttons: Add Rule, Edit, Delete, Move Up, Move Down, Default Action. Real Management Center par: <b>Policies → Access Control</b>, phir policy edit karo; prefilter, decryption aur identity policies policy header aur Advanced tab se linked hoti hain.</p>

<pre class="out">&gt; show running-config access-list
<span class="hl">access-list CSM_FW_ACL_ remark rule-id 9998: PREFILTER POLICY: Default Tunnel and Priority Policy</span>
access-list CSM_FW_ACL_ advanced permit ipinip any any rule-id 9998
access-list CSM_FW_ACL_ remark rule-id 268435457: ACCESS POLICY: NK-ACP - Mandatory
access-list CSM_FW_ACL_ remark rule-id 268435457: L7 RULE: Inside-Out
access-list CSM_FW_ACL_ advanced permit tcp ifc inside any ifc outside any eq www rule-id 268435457
access-list CSM_FW_ACL_ remark rule-id 268434432: ACCESS POLICY: NK-ACP - Default
access-list CSM_FW_ACL_ remark rule-id 268434432: L4 RULE: DEFAULT ACTION RULE
<span class="hl">access-list CSM_FW_ACL_ advanced deny ip any any rule-id 268434432</span></pre>
<p>Ise upar se neeche padho aur order dikhega: pehle prefilter (9998), beech mein aapki rules, aakhir mein default action (hamesha rule-id <b>268434432</b>).</p>

<div class="eg"><p><b>Worked example.</b> PC1 ek site kholta hai jiska IP address Security Intelligence block list par hai, aur rule 1 Inside-Out HTTPS allow karti hai. Result: blocked, kyunki Security Intelligence access control rules se pehle chalti hai. Connection event reason <i>IP Block</i> dikhata hai. Ise allow karne ke liye address Do Not Block list mein jaata hai, nayi rule mein nahi.</p></div>

<div class="warn"><p><b>Common galti.</b> Base policy ke Mandatory section mein upar ek broad Allow rule rakhna. Har child policy use apni rules ke upar inherit karti hai, isliye koi branch us traffic ko ab block nahi kar sakti.</p></div>

<div class="exam"><p><b>Exam trap.</b> Order yaad rakho: prefilter, decryption, Security Intelligence, identity, access control rules, default action. Prefilter Fastpath saare Snort-based steps bypass karta hai. Rule-id 268434432 default action hai; 9998 default prefilter tunnel rule hai.</p></div>

<div class="scn"><h4>Woh rule jo kabhi jeet hi nahi sakti thi</h4><p>Ek partner subnet ko rule 14 se SFTP server tak pahunchne ki ijaazat thi. Connection events rule name nahi, balki reason <i>IP Block</i> ke saath Block dikha rahe the. Partner ke cloud provider ke ek doosre tenant ki galat harkat ke baad partner ka address ek reputation feed mein aa gaya tha. Team ne confirm kiya ki address partner ka hai, use Do Not Block list mein joda, deploy kiya, aur SFTP chal gaya.</p><p><b>Seekh:</b> agar event reason Security Intelligence hai, to rule order irrelevant hai; ise wahan theek karo jahan SI configure hai.</p></div>

<div class="iv"><p class="q">"Threat Defense naye connection ko kis order mein process karta hai?"</p><p>LINA mein prefilter (Fastpath, Analyze, Block), phir Snort mein: decryption policy, Security Intelligence, identity, first match ke saath upar se neeche access control rules, aur default action. Allow rules intrusion aur file policies jodti hain. Mention karo ki address-based Security Intelligence pehle packet par block kar sakti hai, aur default action ka rule-id 268434432 hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: prefilter, decryption, Security Intelligence, identity, access control rules, default action.</li>
<li>Rules upar se neeche evaluate hoti hain; pehla match jeetta hai; condition types ke beech AND, ek ke andar OR.</li>
<li>Mandatory section Default section se pehle; base policies children par rules force kar sakti hain.</li>
<li>Default action choices: Block All, Trust All, Network Discovery Only, Intrusion Prevention.</li>
<li>Lab path: Policies → Access Control; Default Action row hamesha aakhir mein hoti hai.</li>
</ul></div>
`}};export{e as default};