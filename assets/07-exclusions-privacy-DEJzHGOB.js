var e={id:`exclusions-privacy`,h:{en:`Exclusions, privacy and pinning: what must not be decrypted`,hi:`Exclusions, privacy aur pinning: kya decrypt nahi karna chahiye`},body:{en:`

<p><b>Knowing what not to decrypt is as important as knowing how to decrypt.</b> Exclusions come from three sources: privacy and legal duty, technical breakage, and risk decisions. This chapter gives you a framework for all three, and a process to keep the exclusion list healthy.</p>

<h3>Analogy: the doctor's consulting room</h3>
<p>A building security team may check bags at the main door, but it does not walk into a doctor's consulting room to listen in. Some places are private by law and by ethics. A decryption programme needs the same judgement: it protects the organisation, not curiosity about people.</p>

<h3>1. Privacy and legal exclusions</h3>
<p>Decrypting personal traffic can expose passwords, bank details, medical information and private messages. Many countries have data protection and employment rules about monitoring, and some require notice, consent, or consultation with employee representatives. This is not a purely technical decision.</p>
<ul>
<li><b>Get approval</b> from legal, HR and the data protection officer before a pilot, and keep it on record.</li>
<li><b>Tell users.</b> An acceptable-use policy and a login banner should state that web traffic may be inspected for security.</li>
<li><b>Exclude sensitive categories</b> by URL category: <code>financial-services</code> and <code>health-and-medicine</code> at minimum, and review others such as government, legal, education and personal accounts according to your policy.</li>
<li><b>Minimum necessary data.</b> Log metadata (who, where, which policy, result), not content. Do not store decrypted payloads.</li>
<li><b>Limit access.</b> Few people should be able to view decryption logs and certificates. Use roles and audit their use (see sec-aaa-mgmt).</li>
<li><b>Unmanaged and personal devices</b> do not trust your CA, so do not decrypt them.</li>
</ul>
<div class="note"><p><b>Important.</b> This course gives engineering guidance, not legal advice. Rules differ by country and by contract; confirm with your legal team.</p></div>

<h3>2. Technical exclusions</h3>
<table class="cmp"><tr><th>Cause</th><th>What happens</th><th>Fix</th></tr>
<tr><td>Certificate pinning</td><td>The application accepts only a specific certificate or key, so the firewall substitute is rejected; the app reports a connection or security error</td><td>No-decrypt by destination or category; ask the vendor about proxy support</td></tr>
<tr><td>Mutual TLS (client certificates)</td><td>The server requires a certificate that only the client holds; the proxy cannot supply it</td><td>No-decrypt for those endpoints</td></tr>
<tr><td>Unsupported protocol or cipher</td><td>The firewall cannot negotiate the same suite on both sides</td><td>Update; or exclude, with a recorded risk decision</td></tr>
<tr><td>Applications that do not use the system trust store</td><td>They do not know your CA (some tools, runtimes, containers)</td><td>Install the CA in that store; or exclude</td></tr>
<tr><td>Non-HTTP uses of TLS</td><td>Custom protocols over TLS with strict checks</td><td>Exclude by port or destination</td></tr>
</table>
<p>Typical pinned applications include some banking and update clients, some messaging and endpoint-management agents. You find them by symptoms (an application stops working after decryption starts) and by decryption logs showing handshake failures for that server.</p>

<h3>3. The predefined exclusion list</h3>
<p>PAN-OS ships with a list of hostnames known to break under decryption (for example some vendor update services) that you can enable or disable, and you can add your own entries (<b>Device &gt; Certificate Management &gt; SSL Decryption Exclusion</b>). Excluded sessions are not decrypted regardless of rules. The firewall also keeps a cache of servers it temporarily excluded after failures; reference commands (not run in the simulator) are <code>show system setting ssl-decrypt exclude-cache</code> and, to check what a session did, the decryption log.</p>

<h3>How exclusions fit the rulebase</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Exclusions in the rulebase"><rect x="60" y="10" width="520" height="44" rx="9" fill="#bae6fd"/><text x="320" y="29" text-anchor="middle" class="svg-ink" font-size="13">No-decrypt: protected categories</text><text x="320" y="45" text-anchor="middle" class="svg-muted" font-size="11">financial-services, health-and-medicine, others per policy</text><line x1="320" y1="54" x2="320" y2="70" stroke="#64748b" stroke-width="2"/><rect x="60" y="70" width="520" height="44" rx="9" fill="#bbf7d0"/><text x="320" y="89" text-anchor="middle" class="svg-ink" font-size="13">No-decrypt: technical exclusions by destination</text><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="11">pinned apps, mutual TLS endpoints</text><line x1="320" y1="114" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><rect x="60" y="130" width="520" height="44" rx="9" fill="#ddd6fe"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="13">Predefined and custom exclusion list</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="11">hostnames that must not be proxied</text><line x1="320" y1="174" x2="320" y2="190" stroke="#64748b" stroke-width="2"/><rect x="60" y="190" width="520" height="44" rx="9" fill="#fde68a"/><text x="320" y="209" text-anchor="middle" class="svg-ink" font-size="13">Decrypt: general traffic</text><text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="11">everything else you intend to inspect</text></svg><p class="cap">Exclusions come before the broad decrypt rule.</p></div>

<h3>A healthy exclusion process</h3>
<ol>
<li>A user or team reports an application broken after decryption.</li>
<li>Reproduce and check the decryption log for the server name and the reason.</li>
<li>Confirm the cause: pinning, mutual TLS, trust store or cipher.</li>
<li>Prefer the narrowest fix (the specific hostname, not a whole category). Record owner, reason, ticket number and review date.</li>
<li>Review the list every quarter and remove entries that are no longer needed.</li>
</ol>
<p>Use the tools from pan-diag in the same way: the session and counters commands show the flow, the test command shows which rule matches.</p>

<div class="eg"><p><b>Worked example.</b> A finance application stops working the day after the pilot starts. The decryption log shows handshake failures to its vendor server. The vendor confirms the application pins its certificate. The engineer adds the vendor domain to a custom URL category used by the no-decrypt rule at the top, notes the ticket and sets a review date. The application works again and the rest of the finance traffic remains protected by normal controls.</p></div>

<h3>Risk decisions</h3>
<p>Excluding something is a risk acceptance, because the firewall can no longer see inside. Compensate: allow only the needed applications and destinations, apply URL filtering by category on the SNI, keep endpoint protection active on devices, and monitor the traffic volume.</p>

<div class="warn"><p><b>Common mistake.</b> Adding a broad exclusion such as "all of this vendor" or "any" to silence a complaint. Exclusions accumulate silently until decryption covers very little. Prefer narrow hostnames, record an owner and review them.</p></div>
<div class="exam"><p><b>Exam trap.</b> Pinning and mutual TLS cannot be proxied: use no-decrypt. Sensitive categories (financial services, health and medicine) are excluded by policy and law. No-decrypt rules go first. The firewall still can check server certificates with a no-decrypt profile.</p></div>

<div class="scn"><h4>The helpful change that created a privacy problem</h4><p>A security analyst suspected a data leak and asked for decryption of all categories for one week. Nobody had consulted legal, and the banking traffic was captured in the logs. The company stopped, removed the data under its incident process, wrote a decryption standard with legal approval and a no-decrypt list, and added approval to the change process.</p><p><b>Lesson:</b> A technical ability is not an authority. Policy, consent and exclusions come first.</p></div>

<div class="iv"><p class="q">"What do you exclude from SSL decryption and why?"</p><p>Sensitive categories such as financial services and health for privacy and legal reasons, applications that use certificate pinning or mutual TLS because they cannot be proxied, and anything my legal and HR teams exclude. I keep exclusions narrow, record an owner and a review date, and use a no-decrypt profile to still check server certificates. I also do not decrypt unmanaged or personal devices.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Exclude sensitive categories for privacy and legal reasons; get legal, HR and user notice first.</li>
<li>Pinned applications and mutual TLS cannot be proxied; use no-decrypt.</li>
<li>No-decrypt rules go above decrypt rules; use the predefined and custom exclusion lists.</li>
<li>Keep exclusions narrow, owned and reviewed.</li>
<li>Log metadata, not content; limit who can see decryption data.</li>
</ul></div>

`,hi:`

<p><b>Kya decrypt nahi karna yeh jaanna utna hi zaroori hai jitna kaise decrypt karna.</b> Exclusions teen sources se aate hain: privacy aur legal duty, technical breakage, aur risk decisions. Yeh chapter teeno ke liye framework deta hai, aur exclusion list ko healthy rakhne ka process.</p>

<h3>Analogy: doctor ka consulting room</h3>
<p>Building security team main darwaze par bags check kar sakti hai, lekin woh doctor ke consulting room mein jaakar baatein nahi sunti. Kuch jagahein kanoon aur ethics se private hain. Decryption programme ko wahi vivek chahiye: yeh organisation ko protect karta hai, logon ke baare mein jigyasa ke liye nahi.</p>

<h3>1. Privacy aur legal exclusions</h3>
<p>Personal traffic decrypt karne se passwords, bank details, medical information aur private messages khul sakte hain. Kai deshon mein monitoring ke baare mein data protection aur employment niyam hain, aur kuch notice, consent, ya employee representatives se salaah maangte hain. Yeh sirf technical decision nahi hai.</p>
<ul>
<li>Pilot se pehle legal, HR aur data protection officer se <b>approval lo</b> aur record rakho.</li>
<li><b>Users ko batao.</b> Acceptable-use policy aur login banner mein likha ho ki web traffic security ke liye inspect ho sakta hai.</li>
<li>URL category se <b>sensitive categories exclude karo</b>: kam se kam <code>financial-services</code> aur <code>health-and-medicine</code>, aur apni policy ke hisaab se government, legal, education aur personal accounts jaisi doosri categories review karo.</li>
<li><b>Minimum zaroori data.</b> Metadata (kaun, kahan, kaunsi policy, result) log karo, content nahi. Decrypted payloads store mat karo.</li>
<li><b>Access limit karo.</b> Bahut kam logon ko decryption logs aur certificates dekhne ka haq ho. Roles use karo aur unka use audit karo (sec-aaa-mgmt dekho).</li>
<li><b>Unmanaged aur personal devices</b> aapki CA par trust nahi karte, isliye unhe decrypt mat karo.</li>
</ul>
<div class="note"><p><b>Zaroori.</b> Yeh course engineering guidance deta hai, legal advice nahi. Niyam desh aur contract ke hisaab se alag hote hain; apni legal team se confirm karo.</p></div>

<h3>2. Technical exclusions</h3>
<table class="cmp"><tr><th>Kaaran</th><th>Kya hota hai</th><th>Fix</th></tr>
<tr><td>Certificate pinning</td><td>Application sirf ek specific certificate ya key accept karti hai, isliye firewall ka substitute reject hota hai; app connection ya security error deti hai</td><td>Destination ya category se no-decrypt; vendor se proxy support poochho</td></tr>
<tr><td>Mutual TLS (client certificates)</td><td>Server aisa certificate maangta hai jo sirf client ke paas hai; proxy woh nahi de sakta</td><td>Un endpoints ke liye no-decrypt</td></tr>
<tr><td>Unsupported protocol ya cipher</td><td>Firewall dono taraf same suite negotiate nahi kar sakta</td><td>Update; ya recorded risk decision ke saath exclude</td></tr>
<tr><td>Applications jo system trust store use nahi karti</td><td>Unhe aapki CA ka pata nahi (kuch tools, runtimes, containers)</td><td>Us store mein CA install karo; ya exclude</td></tr>
<tr><td>TLS ke non-HTTP uses</td><td>TLS par custom protocols jinme strict checks hain</td><td>Port ya destination se exclude</td></tr>
</table>
<p>Aam pinned applications mein kuch banking aur update clients, kuch messaging aur endpoint-management agents hote hain. Inhe symptoms se dhoondhte hain (decryption shuru hone ke baad application band) aur decryption logs se jo us server ke handshake failures dikhate hain.</p>

<h3>3. Predefined exclusion list</h3>
<p>PAN-OS ek hostnames ki list ke saath aata hai jo decryption mein tootne ke liye jaane jaate hain (jaise kuch vendor update services), jise aap enable ya disable kar sakte ho, aur apni entries jod sakte ho (<b>Device &gt; Certificate Management &gt; SSL Decryption Exclusion</b>). Excluded sessions rules se bina matlab decrypt nahi hote. Firewall un servers ka cache bhi rakhta hai jinhe failures ke baad temporarily exclude kiya; reference commands (not run in the simulator) hain <code>show system setting ssl-decrypt exclude-cache</code> aur, session ne kya kiya yeh check karne ke liye, decryption log.</p>

<h3>Exclusions rulebase mein kaise fit hote hain</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Exclusions in the rulebase"><rect x="60" y="10" width="520" height="44" rx="9" fill="#bae6fd"/><text x="320" y="29" text-anchor="middle" class="svg-ink" font-size="13">No-decrypt: protected categories</text><text x="320" y="45" text-anchor="middle" class="svg-muted" font-size="11">financial-services, health-and-medicine, policy ke hisaab se aur</text><line x1="320" y1="54" x2="320" y2="70" stroke="#64748b" stroke-width="2"/><rect x="60" y="70" width="520" height="44" rx="9" fill="#bbf7d0"/><text x="320" y="89" text-anchor="middle" class="svg-ink" font-size="13">No-decrypt: destination se technical exclusions</text><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="11">pinned apps, mutual TLS endpoints</text><line x1="320" y1="114" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><rect x="60" y="130" width="520" height="44" rx="9" fill="#ddd6fe"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="13">Predefined aur custom exclusion list</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="11">hostnames jinhe proxy nahi karna</text><line x1="320" y1="174" x2="320" y2="190" stroke="#64748b" stroke-width="2"/><rect x="60" y="190" width="520" height="44" rx="9" fill="#fde68a"/><text x="320" y="209" text-anchor="middle" class="svg-ink" font-size="13">Decrypt: general traffic</text><text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="11">baaki sab jo aap inspect karna chahte ho</text></svg><p class="cap">Exclusions broad decrypt rule se pehle aate hain.</p></div>

<h3>Healthy exclusion process</h3>
<ol>
<li>User ya team report karti hai ki decryption ke baad application toot gayi.</li>
<li>Reproduce karo aur decryption log mein server name aur reason dekho.</li>
<li>Kaaran confirm karo: pinning, mutual TLS, trust store ya cipher.</li>
<li>Sabse narrow fix pasand karo (specific hostname, poori category nahi). Owner, reason, ticket number aur review date record karo.</li>
<li>Har quarter list review karo aur jo entries ab zaroori nahi unhe hatao.</li>
</ol>
<p>pan-diag ke tools isi tarah use karo: session aur counters commands flow dikhate hain, test command dikhata hai kaunsi rule match hoti hai.</p>

<div class="eg"><p><b>Worked example.</b> Pilot shuru hone ke agle din ek finance application band ho jaati hai. Decryption log uske vendor server ke handshake failures dikhata hai. Vendor confirm karta hai ki application certificate pin karti hai. Engineer vendor domain ko custom URL category mein jodta hai jo sabse upar ki no-decrypt rule use karti hai, ticket note karta hai aur review date set karta hai. Application phir chalti hai aur baaki finance traffic normal controls se protected rehta hai.</p></div>

<h3>Risk decisions</h3>
<p>Kuch exclude karna risk acceptance hai, kyunki firewall ab andar nahi dekh sakta. Compensate karo: sirf zaroori applications aur destinations allow karo, SNI par category se URL filtering lagao, devices par endpoint protection active rakho, aur traffic volume monitor karo.</p>

<div class="warn"><p><b>Common mistake.</b> Shikayat shaant karne ke liye "is vendor ka sab" ya "any" jaisa broad exclusion jodna. Exclusions chupchaap jama hote hain jab tak decryption bahut kam cover kare. Narrow hostnames pasand karo, owner record karo aur review karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Pinning aur mutual TLS proxy nahi ho sakte: no-decrypt use karo. Sensitive categories (financial services, health and medicine) policy aur kanoon se exclude hoti hain. No-decrypt rules pehle. Firewall no-decrypt profile se phir bhi server certificates check kar sakta hai.</p></div>

<div class="scn"><h4>Madadgar change jisne privacy problem bana di</h4><p>Ek security analyst ko data leak ka shak tha aur usne ek hafte ke liye saari categories ka decryption maanga. Kisi ne legal se baat nahi ki thi, aur employees ka banking traffic logs mein capture ho gaya. Company ne rok diya, incident process ke under data hataya, legal approval ke saath decryption standard aur no-decrypt list likhi, aur change process mein approval jodaa.</p><p><b>Lesson:</b> Technical kshamata authority nahi hai. Policy, consent aur exclusions pehle.</p></div>

<div class="iv"><p class="q">"SSL decryption se kya exclude karte ho aur kyun?"</p><p>Privacy aur legal wajah se financial services aur health jaisi sensitive categories, certificate pinning ya mutual TLS use karne waali applications kyunki woh proxy nahi ho sakti, aur jo bhi meri legal aur HR teams exclude karein. Exclusions narrow rakhta hoon, owner aur review date record karta hoon, aur no-decrypt profile se phir bhi server certificates check karta hoon. Unmanaged ya personal devices bhi decrypt nahi karta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Privacy aur legal wajah se sensitive categories exclude karo; pehle legal, HR aur user notice lo.</li>
<li>Pinned applications aur mutual TLS proxy nahi ho sakte; no-decrypt use karo.</li>
<li>No-decrypt rules decrypt rules se upar; predefined aur custom exclusion lists use karo.</li>
<li>Exclusions narrow, owned aur reviewed rakho.</li>
<li>Metadata log karo, content nahi; decryption data kaun dekhe yeh limit karo.</li>
</ul></div>

`}};export{e as default};