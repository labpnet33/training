var e={id:`phase-1`,h:{en:`Phase 1: IKE proposal, policy and gateway`,hi:`Phase 1: IKE proposal, policy aur gateway`},body:{en:`<p><b>Analogy.</b> Before two diplomats exchange secrets they agree on a language, a cipher and a password. <b>Phase 1</b> is that agreement: both firewalls must pick the <i>same</i> algorithms and prove they hold the <i>same</i> key. If one detail differs, the meeting ends at once.</p>
<h3>Three objects</h3>
<ol><li><b>IKE proposal</b>: the algorithm set: authentication method, Diffie-Hellman group, authentication (hash) algorithm, encryption algorithm, lifetime.</li><li><b>IKE policy</b>: the mode (main or aggressive), the proposals to offer and the <b>pre-shared key</b>.</li><li><b>IKE gateway</b>: the peer address, the local external interface, the policy and options such as version and dead peer detection.</li></ol>
<pre class="code">set security ike proposal IKE-P authentication-method pre-shared-keys
set security ike proposal IKE-P dh-group group14
set security ike proposal IKE-P authentication-algorithm sha-256
set security ike proposal IKE-P encryption-algorithm aes-256-cbc
set security ike policy IKE-POL mode main
set security ike policy IKE-POL proposals IKE-P
set security ike policy IKE-POL pre-shared-key ascii-text "NkSecret123"
set security ike gateway GW1 ike-policy IKE-POL
set security ike gateway GW1 address 198.51.100.2
set security ike gateway GW1 external-interface ge-0/0/0.0</pre>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Proposal inside policy inside gateway"><rect x="10" y="10" width="620" height="130" rx="12" fill="#e2e8f0"/><text x="25" y="32" class="svg-ink" font-size="13">gateway GW1: peer address, external interface</text><rect x="30" y="45" width="580" height="85" rx="10" fill="#fde68a"/><text x="45" y="67" class="svg-ink" font-size="13">policy IKE-POL: main mode, pre-shared key</text><rect x="50" y="78" width="540" height="42" rx="8" fill="#bbf7d0"/><text x="320" y="104" text-anchor="middle" class="svg-ink" font-size="13">proposal IKE-P: group14, sha-256, aes-256-cbc</text></svg><p class="cap">The gateway uses a policy; the policy offers proposals.</p></div>
<h3>What must match</h3>
<table class="cmp"><tr><th>Item</th><th>Must be the same on both ends?</th></tr>
<tr><td>DH group, hash, encryption, authentication method</td><td>Yes (at least one proposal in common)</td></tr>
<tr><td>Pre-shared key</td><td>Yes</td></tr>
<tr><td>IKE version, and IKEv1 mode</td><td>Yes</td></tr>
<tr><td>Gateway address</td><td>Each end names the <i>other</i> end's address</td></tr>
<tr><td>Lifetime</td><td>No: the lower value wins</td></tr></table>
<p>The peer must also be able to <b>receive</b> your IKE packets: the untrust zone needs <code>host-inbound-traffic system-services ike</code> on both firewalls.</p>
<div class="eg"><p><b>Worked example.</b> Delhi proposes group14, Pune group5. IKE fails with "No proposal chosen" in the log. After changing Pune to group14 the log changes to "Authentication failed" because the keys differ ("NkSecret123" and "NkSecret124"). One fix reveals the next.</p></div>
<div class="warn"><p><b>Common mistake.</b> Fixing a mismatch and not checking again. Read the IKE log after each change: errors can be layered. Another trap: a leaf list. <code>set ... gateway GW1 address X</code> <i>adds</i> an address; <code>delete</code> the old one first.</p></div>
<div class="exam"><p><b>Exam trap.</b> The IKE gateway holds the <i>remote</i> peer address. The local interface is named by <code>external-interface</code> (or <code>local-address</code>). Aggressive mode is quicker but exposes identities.</p></div>
<div class="scn"><h4>Same key, different keyboards</h4><p>A tunnel stayed down after a rebuild. The log said "Authentication failed". One side had a trailing space in the key. Retyping the key on both ends brought the tunnel up.</p><p><b>Lesson:</b> authentication failures are almost always the key (or the identity).</p></div>
<div class="iv"><p class="q">"What is negotiated in phase 1?"</p><p>The protection of the IKE channel: authentication method, DH group, hash and encryption algorithms, mode, and the peer's identity using a pre-shared key or certificate. The result is the IKE SA, which protects phase 2.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Proposal, policy and gateway build phase 1.</li><li>Algorithms, key, version and mode must match.</li><li>The IKE log tells which check failed.</li></ul></div>`,hi:`<p><b>Analogy.</b> Do diplomats secrets share karne se pehle bhasha, cipher aur password par sehmat hote hain. <b>Phase 1</b> wahi sehmati hai: dono firewalls ko <i>wahi</i> algorithms chunne hain aur saabit karna hai ki unke paas <i>wahi</i> key hai. Ek detail alag ho to meeting turant khatam.</p>
<h3>Teen objects</h3>
<ol><li><b>IKE proposal</b>: algorithm set: authentication method, Diffie-Hellman group, authentication (hash) algorithm, encryption algorithm, lifetime.</li><li><b>IKE policy</b>: mode (main ya aggressive), offer karne ke proposals aur <b>pre-shared key</b>.</li><li><b>IKE gateway</b>: peer address, local external interface, policy aur version tatha dead peer detection jaise options.</li></ol>
<pre class="code">set security ike proposal IKE-P authentication-method pre-shared-keys
set security ike proposal IKE-P dh-group group14
set security ike proposal IKE-P authentication-algorithm sha-256
set security ike proposal IKE-P encryption-algorithm aes-256-cbc
set security ike policy IKE-POL mode main
set security ike policy IKE-POL proposals IKE-P
set security ike policy IKE-POL pre-shared-key ascii-text "NkSecret123"
set security ike gateway GW1 ike-policy IKE-POL
set security ike gateway GW1 address 198.51.100.2
set security ike gateway GW1 external-interface ge-0/0/0.0</pre>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Gateway ke andar policy ke andar proposal"><rect x="10" y="10" width="620" height="130" rx="12" fill="#e2e8f0"/><text x="25" y="32" class="svg-ink" font-size="13">gateway GW1: peer address, external interface</text><rect x="30" y="45" width="580" height="85" rx="10" fill="#fde68a"/><text x="45" y="67" class="svg-ink" font-size="13">policy IKE-POL: main mode, pre-shared key</text><rect x="50" y="78" width="540" height="42" rx="8" fill="#bbf7d0"/><text x="320" y="104" text-anchor="middle" class="svg-ink" font-size="13">proposal IKE-P: group14, sha-256, aes-256-cbc</text></svg><p class="cap">Gateway policy use karta hai; policy proposals offer karti hai.</p></div>
<h3>Kya match hona chahiye</h3>
<table class="cmp"><tr><th>Item</th><th>Dono ends par same?</th></tr>
<tr><td>DH group, hash, encryption, authentication method</td><td>Haan (kam se kam ek proposal common)</td></tr>
<tr><td>Pre-shared key</td><td>Haan</td></tr>
<tr><td>IKE version, aur IKEv1 mode</td><td>Haan</td></tr>
<tr><td>Gateway address</td><td>Har end <i>doosre</i> end ka address likhta hai</td></tr>
<tr><td>Lifetime</td><td>Nahi: kam value jeet-ti hai</td></tr></table>
<p>Peer ko aapke IKE packets <b>receive</b> bhi karne chahiye: dono firewalls par untrust zone ko <code>host-inbound-traffic system-services ike</code> chahiye.</p>
<div class="eg"><p><b>Worked example.</b> Delhi group14 propose karta hai, Pune group5. IKE "No proposal chosen" ke saath fail hota hai. Pune ko group14 karne ke baad log "Authentication failed" mein badal jata hai kyunki keys alag hain ("NkSecret123" aur "NkSecret124"). Ek fix agli galti dikhata hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Mismatch theek karke dobara check na karna. Har change ke baad IKE log padho: errors parat-dar ho sakte hain. Ek aur jaal: leaf list. <code>set ... gateway GW1 address X</code> address <i>jodta</i> hai; pehle purana <code>delete</code> karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> IKE gateway mein <i>remote</i> peer address hota hai. Local interface <code>external-interface</code> (ya <code>local-address</code>) se batayi jati hai. Aggressive mode tez hai lekin identities expose karta hai.</p></div>
<div class="scn"><h4>Same key, alag keyboard</h4><p>Rebuild ke baad tunnel down raha. Log ne "Authentication failed" kaha. Ek side ki key mein aakhir mein space tha. Dono ends par key dobara type karne se tunnel up ho gaya.</p><p><b>Lesson:</b> authentication failures lagbhag hamesha key (ya identity) hoti hain.</p></div>
<div class="iv"><p class="q">"Phase 1 mein kya negotiate hota hai?"</p><p>IKE channel ki protection: authentication method, DH group, hash aur encryption algorithms, mode, aur pre-shared key ya certificate se peer ki identity. Nateeja IKE SA hai, jo phase 2 ko protect karta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Proposal, policy aur gateway phase 1 banate hain.</li><li>Algorithms, key, version aur mode match hone chahiye.</li><li>IKE log batata hai kaunsi check fail hui.</li></ul></div>`}};export{e as default};