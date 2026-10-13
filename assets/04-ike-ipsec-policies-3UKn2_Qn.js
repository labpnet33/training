var e={id:`ike-ipsec-policies`,h:{en:`IKE and IPsec policies: VPN objects, authentication and PFS`,hi:`IKE aur IPsec policies: VPN objects, authentication aur PFS`},body:{en:`
<p>Two VPN peers are like two people who must speak a common language before they can talk. The <b>IKE policy</b> lists the languages your firewall can use for the meeting room (the IKE SA). The <b>IPsec proposal</b> lists the languages for the delivery trucks (the child SAs). If the two lists share at least one entry, the conversation starts. If not, nothing happens and the log says <code>NO_PROPOSAL_CHOSEN</code>.</p>

<h3>Where the objects live</h3>
<p>In the Management Center the policies are reusable objects under <b>Objects → VPN Objects</b>, with one tab per kind: <b>IKEv2 Policy</b>, <b>IKEv2 IPsec Proposal</b>, <b>IKEv1 Policy</b>, <b>IKEv1 IPsec Proposal</b>, <b>Address Pools</b>, <b>Certificates</b> and <b>Secure Client File</b>. VPN objects are global: an object created while looking at one device can be selected in any topology. Objects with a lock icon are system defined and read-only.</p>
<table class="cmp"><tr><th>System object</th><th>Contents</th></tr>
<tr><td>AES-GCM-NULL-SHA-LATEST (IKEv2 policy, priority 1)</td><td>AES-GCM-256/192/128, integrity NULL, PRF SHA-512 to SHA-1, DH 21, 20, 19, 16, 15, 14</td></tr>
<tr><td>AES-SHA-SHA-LATEST (IKEv2 policy, priority 2)</td><td>AES-256/192/128, integrity and PRF SHA-512 to SHA-1, DH 21 to 14</td></tr>
<tr><td>AES-GCM (IKEv2 IPsec proposal)</td><td>ESP AES-GCM-256/192/128, hash NULL</td></tr>
<tr><td>AES-SHA (IKEv2 IPsec proposal)</td><td>ESP AES-256/192/128, hash SHA-512 to SHA-1</td></tr></table>
<p>System objects are broad on purpose, so they match many peers. A security standard usually wants something narrower; then you create your own object.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Proposal matching">
<rect x="10" y="20" width="200" height="120" rx="8" fill="#fed7aa"/><text x="110" y="42" text-anchor="middle" class="svg-ink" font-size="13">NK-FTD offers</text>
<text x="110" y="68" text-anchor="middle" class="svg-muted" font-size="12">AES-256, AES-192, AES</text><text x="110" y="88" text-anchor="middle" class="svg-muted" font-size="12">SHA-512 ... SHA-256</text><text x="110" y="108" text-anchor="middle" class="svg-muted" font-size="12">DH 21, 20, 19, 14</text>
<rect x="430" y="20" width="200" height="120" rx="8" fill="#bae6fd"/><text x="530" y="42" text-anchor="middle" class="svg-ink" font-size="13">BR1 accepts</text>
<text x="530" y="68" text-anchor="middle" class="svg-muted" font-size="12">AES-CBC-256</text><text x="530" y="88" text-anchor="middle" class="svg-muted" font-size="12">SHA-256</text><text x="530" y="108" text-anchor="middle" class="svg-muted" font-size="12">DH 14</text>
<rect x="240" y="55" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="77" text-anchor="middle" class="svg-ink" font-size="13">chosen</text><text x="320" y="95" text-anchor="middle" class="svg-muted" font-size="12">AES-256 / SHA-256 / 14</text>
<line x1="210" y1="80" x2="240" y2="80" stroke="#64748b"/><line x1="400" y1="80" x2="430" y2="80" stroke="#64748b"/>
<text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="12">no overlap at all = NO_PROPOSAL_CHOSEN</text>
</svg><p class="cap">The responder picks one combination that both lists contain.</p></div>
<h3>Building an IKEv2 policy object</h3>
<p>The <b>New IKEv2 Policy</b> dialog has Name, <b>Priority</b> (lower is offered first), <b>Lifetime (seconds)</b> (default 86400) and four check-box groups: <b>Encryption Algorithms</b>, <b>Integrity Algorithms</b>, <b>PRF Algorithms</b> and <b>Diffie-Hellman Groups</b>. Rules the dialog enforces, and the exam expects you to know:</p>
<ul><li>AES-GCM policies must use integrity <b>NULL</b>; the PRF is chosen separately.</li>
<li>Integrity NULL is only valid with AES-GCM.</li>
<li>Do not mix AES-GCM and CBC ciphers in one policy: create two policies if you need both.</li></ul>
<p>An <b>IKEv2 IPsec Proposal</b> has only <b>ESP Encryption</b> and <b>ESP Hash</b>; with AES-GCM the hash is NULL. IKEv1 objects are single-choice (one encryption, one hash, one authentication method, one DH group), because IKEv1 needs an exact match.</p>

<div class="eg"><p><b>Worked example (lab: Threat Defense to Threat Defense).</b> The security standard says IKEv2 only, AES-GCM-256 with PRF SHA-384 and DH group 20, ESP AES-GCM-256 and PFS group 20. Create IKEv2 policy <b>NK-IKEV2-GCM</b>: Encryption AES-GCM-256, Integrity NULL, PRF SHA384, DH Group 20. Create IKEv2 IPsec proposal <b>NK-ESP-GCM</b>: ESP Encryption AES-GCM-256, ESP Hash NULL. After deploy the device shows:</p>
<pre class="code">crypto ikev2 policy 5
 encryption aes-gcm-256
 integrity null
 group 20
 prf sha384
 lifetime seconds 86400
crypto ipsec ikev2 ipsec-proposal CSM_IP_1
 protocol esp encryption aes-gcm-256
 protocol esp integrity null</pre></div>

<h3>Read the peer before you choose</h3>
<p>For an extranet peer, never guess. In the first lab the branch team owns BR1, so you read its proposal first (this works from user mode):</p>
<pre class="out">BR1&gt; show crypto ikev2 proposal
 IKEv2 proposal: NK-PROP
     Encryption : AES-CBC-256
     Integrity  : SHA256
     PRF        : SHA256
     <span class="hl">DH Group   : DH_GROUP_2048_MODP/Group 14</span></pre>
<p>AES-CBC-256 / SHA-256 / group 14 is inside AES-SHA-SHA-LATEST, and the router's transform set (esp-aes 256 esp-sha256-hmac) is inside AES-SHA, so the system objects are enough for that tunnel.</p>

<h3>Authentication: pre-shared key or certificate</h3>
<p>In the <b>2 · IKE</b> step, <b>Authentication Type</b> is either <b>Pre-shared Manual Key</b> or <b>Certificate</b>. A pre-shared key is simple: type the same string in <b>Key</b> and <b>Confirm Key</b>, and agree it with the peer over a secure channel. It does not scale (every peer pair shares a secret) and a weak key can be guessed offline. Certificates scale better: each device enrols an identity certificate from a CA both sides trust, and IKE_AUTH carries a signature instead of a shared secret. A wrong key or an untrusted certificate shows up as <code>AUTHENTICATION_FAILED</code>.</p>

<h3>IPsec step: PFS and lifetime</h3>
<p>In <b>3 · IPsec</b>, tick <b>Enable Perfect Forward Secrecy</b> and pick the <b>Modulus Group</b> (for example Group 20). The device configuration gets <code>crypto map CSM_outside_map 1 set pfs group20</code>. Both peers must agree: PFS on one side only breaks the child SA. <b>Lifetime Duration</b> (default 28800 seconds) controls how often the child SA rekeys; lifetimes do not have to match, the lower one wins.</p>

<div class="warn"><p><b>Common mistakes.</b> Editing a system object (it is locked: create a copy instead); creating a perfect custom policy but leaving the topology pointing at the old one; choosing DH group 20 in the IKE policy and assuming PFS uses it automatically (PFS has its own Modulus Group); mistyping Confirm Key, which the wizard reports as "The keys do not match".</p></div>

<div class="exam"><p><b>Exam trap.</b> In IKEv2 the encryption, integrity, PRF and DH lists are matched as a set: any combination the peer accepts is fine. In IKEv1 a policy matches only if encryption, hash, authentication and DH group are all identical. Also, PFS mismatch is a phase 2 problem, not phase 1.</p></div>

<div class="scn"><h4>The router that was hardened overnight</h4><p>Ticket INC-9310: the branch team hardened BR1 to SHA-384 and group 20, and the tunnel to HQ died. NK-FTD still used a custom policy NK-IKE-HQ with SHA-256 and group 14 only. The log showed <code>Negotiation aborted due to ERROR: Received no proposal chosen notify</code>. The engineer read BR1's proposal, edited NK-IKE-HQ to include SHA-384 integrity and PRF and DH group 20 (keeping the old values for the other branches), deployed, and the error changed to the next stage of the negotiation, which he then fixed in turn.</p><p><b>Lesson:</b> add the new values to the policy instead of replacing them when several peers share it.</p></div>

<div class="iv"><p class="q">"Your partner wants AES-GCM. What do you configure on the Threat Defense, and what is different from AES-CBC?"</p><p>Create an IKEv2 policy with AES-GCM-256, integrity NULL, a PRF such as SHA-384 and a DH group such as 20, and an IKEv2 IPsec proposal with ESP AES-GCM-256 and hash NULL. Explain that GCM is AEAD (encryption plus authentication tag in one step), so a separate HMAC is not used, but IKE still needs a PRF to derive keys. Mention priority order, matching PFS on both sides, and verifying with <code>show vpn-sessiondb l2l</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IKEv2 policies and IPsec proposals are global objects in Objects → VPN Objects; system objects are locked.</li>
<li>Lower priority number = offered first; IKEv2 needs one acceptable combination, IKEv1 needs an exact match.</li>
<li>AES-GCM: integrity NULL plus a PRF in IKE, ESP hash NULL in IPsec; never mix GCM and CBC in one IKEv2 policy.</li>
<li>Authentication is a pre-shared manual key or certificates; failures show as AUTHENTICATION_FAILED.</li>
<li>PFS has its own Modulus Group and must match on both peers.</li>
</ul></div>
`,hi:`
<p>Do VPN peers aise do logon jaise hain jinhe baat karne se pehle ek common bhasha chahiye. <b>IKE policy</b> un bhashaon ki list hai jo aapka firewall meeting room (IKE SA) ke liye use kar sakta hai. <b>IPsec proposal</b> delivery trucks (child SAs) ki bhashaon ki list hai. Agar dono lists mein kam se kam ek entry common ho, baat shuru hoti hai. Nahi to kuch nahi hota aur log kehta hai <code>NO_PROPOSAL_CHOSEN</code>.</p>

<h3>Objects kahan rehte hain</h3>
<p>Management Center mein policies reusable objects hain <b>Objects → VPN Objects</b> ke andar, har kind ka ek tab: <b>IKEv2 Policy</b>, <b>IKEv2 IPsec Proposal</b>, <b>IKEv1 Policy</b>, <b>IKEv1 IPsec Proposal</b>, <b>Address Pools</b>, <b>Certificates</b> aur <b>Secure Client File</b>. VPN objects global hote hain: ek device dekhte hue banaya object kisi bhi topology mein select ho sakta hai. Lock icon wale objects system defined aur read-only hain.</p>
<table class="cmp"><tr><th>System object</th><th>Contents</th></tr>
<tr><td>AES-GCM-NULL-SHA-LATEST (IKEv2 policy, priority 1)</td><td>AES-GCM-256/192/128, integrity NULL, PRF SHA-512 se SHA-1, DH 21, 20, 19, 16, 15, 14</td></tr>
<tr><td>AES-SHA-SHA-LATEST (IKEv2 policy, priority 2)</td><td>AES-256/192/128, integrity aur PRF SHA-512 se SHA-1, DH 21 se 14</td></tr>
<tr><td>AES-GCM (IKEv2 IPsec proposal)</td><td>ESP AES-GCM-256/192/128, hash NULL</td></tr>
<tr><td>AES-SHA (IKEv2 IPsec proposal)</td><td>ESP AES-256/192/128, hash SHA-512 se SHA-1</td></tr></table>
<p>System objects jaan-boojhkar broad hain, taaki bahut peers se match karein. Security standard aam taur par kuch narrow chahta hai; tab aap apna object banate ho.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Proposal matching">
<rect x="10" y="20" width="200" height="120" rx="8" fill="#fed7aa"/><text x="110" y="42" text-anchor="middle" class="svg-ink" font-size="13">NK-FTD offers</text>
<text x="110" y="68" text-anchor="middle" class="svg-muted" font-size="12">AES-256, AES-192, AES</text><text x="110" y="88" text-anchor="middle" class="svg-muted" font-size="12">SHA-512 ... SHA-256</text><text x="110" y="108" text-anchor="middle" class="svg-muted" font-size="12">DH 21, 20, 19, 14</text>
<rect x="430" y="20" width="200" height="120" rx="8" fill="#bae6fd"/><text x="530" y="42" text-anchor="middle" class="svg-ink" font-size="13">BR1 accept karta hai</text>
<text x="530" y="68" text-anchor="middle" class="svg-muted" font-size="12">AES-CBC-256</text><text x="530" y="88" text-anchor="middle" class="svg-muted" font-size="12">SHA-256</text><text x="530" y="108" text-anchor="middle" class="svg-muted" font-size="12">DH 14</text>
<rect x="240" y="55" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="77" text-anchor="middle" class="svg-ink" font-size="13">chuna gaya</text><text x="320" y="95" text-anchor="middle" class="svg-muted" font-size="12">AES-256 / SHA-256 / 14</text>
<line x1="210" y1="80" x2="240" y2="80" stroke="#64748b"/><line x1="400" y1="80" x2="430" y2="80" stroke="#64748b"/>
<text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="12">bilkul overlap nahi = NO_PROPOSAL_CHOSEN</text>
</svg><p class="cap">Responder ek aisa combination chunta hai jo dono lists mein ho.</p></div>
<h3>IKEv2 policy object banana</h3>
<p><b>New IKEv2 Policy</b> dialog mein Name, <b>Priority</b> (kam number pehle offer hota hai), <b>Lifetime (seconds)</b> (default 86400) aur chaar check-box groups hain: <b>Encryption Algorithms</b>, <b>Integrity Algorithms</b>, <b>PRF Algorithms</b> aur <b>Diffie-Hellman Groups</b>. Dialog yeh rules enforce karta hai, aur exam expect karta hai ki aap jaano:</p>
<ul><li>AES-GCM policies integrity <b>NULL</b> use karti hain; PRF alag se chuna jaata hai.</li>
<li>Integrity NULL sirf AES-GCM ke saath valid hai.</li>
<li>Ek policy mein AES-GCM aur CBC ciphers mix mat karo: dono chahiye to do policies banao.</li></ul>
<p><b>IKEv2 IPsec Proposal</b> mein sirf <b>ESP Encryption</b> aur <b>ESP Hash</b> hote hain; AES-GCM ke saath hash NULL hota hai. IKEv1 objects single-choice hain (ek encryption, ek hash, ek authentication method, ek DH group), kyunki IKEv1 ko exact match chahiye.</p>

<div class="eg"><p><b>Worked example (lab: Threat Defense se Threat Defense).</b> Security standard kehta hai sirf IKEv2, PRF SHA-384 aur DH group 20 ke saath AES-GCM-256, ESP AES-GCM-256 aur PFS group 20. IKEv2 policy <b>NK-IKEV2-GCM</b> banao: Encryption AES-GCM-256, Integrity NULL, PRF SHA384, DH Group 20. IKEv2 IPsec proposal <b>NK-ESP-GCM</b> banao: ESP Encryption AES-GCM-256, ESP Hash NULL. Deploy ke baad device dikhata hai:</p>
<pre class="code">crypto ikev2 policy 5
 encryption aes-gcm-256
 integrity null
 group 20
 prf sha384
 lifetime seconds 86400
crypto ipsec ikev2 ipsec-proposal CSM_IP_1
 protocol esp encryption aes-gcm-256
 protocol esp integrity null</pre></div>

<h3>Chunne se pehle peer ko padho</h3>
<p>Extranet peer ke liye kabhi guess mat karo. Pehle lab mein BR1 branch team ka hai, isliye aap pehle uska proposal padhte ho (yeh user mode se chalta hai):</p>
<pre class="out">BR1&gt; show crypto ikev2 proposal
 IKEv2 proposal: NK-PROP
     Encryption : AES-CBC-256
     Integrity  : SHA256
     PRF        : SHA256
     <span class="hl">DH Group   : DH_GROUP_2048_MODP/Group 14</span></pre>
<p>AES-CBC-256 / SHA-256 / group 14 AES-SHA-SHA-LATEST ke andar hai, aur router ka transform set (esp-aes 256 esp-sha256-hmac) AES-SHA ke andar hai, isliye us tunnel ke liye system objects kaafi hain.</p>

<h3>Authentication: pre-shared key ya certificate</h3>
<p><b>2 · IKE</b> step mein <b>Authentication Type</b> ya to <b>Pre-shared Manual Key</b> hai ya <b>Certificate</b>. Pre-shared key simple hai: <b>Key</b> aur <b>Confirm Key</b> mein same string type karo, aur peer ke saath secure channel par agree karo. Yeh scale nahi karta (har peer pair ek secret share karta hai) aur kamzor key offline guess ho sakti hai. Certificates behtar scale karte hain: har device ek aise CA se identity certificate enrol karta hai jis par dono sides trust karti hain, aur IKE_AUTH shared secret ki jagah signature le jaata hai. Galat key ya untrusted certificate <code>AUTHENTICATION_FAILED</code> ki tarah dikhta hai.</p>

<h3>IPsec step: PFS aur lifetime</h3>
<p><b>3 · IPsec</b> mein <b>Enable Perfect Forward Secrecy</b> tick karo aur <b>Modulus Group</b> chuno (jaise Group 20). Device configuration ko milta hai <code>crypto map CSM_outside_map 1 set pfs group20</code>. Dono peers agree karne chahiye: sirf ek side par PFS child SA tod deta hai. <b>Lifetime Duration</b> (default 28800 seconds) control karta hai child SA kitni baar rekey hota hai; lifetimes match hona zaroori nahi, kam wala jeetta hai.</p>

<div class="warn"><p><b>Common mistakes.</b> System object edit karna (woh locked hai: copy banao); perfect custom policy banana par topology ko purani wali par chhod dena; IKE policy mein DH group 20 chunna aur maan lena ki PFS apne aap use use karega (PFS ka apna Modulus Group hai); Confirm Key galat type karna, jise wizard "The keys do not match" bolta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> IKEv2 mein encryption, integrity, PRF aur DH lists set ki tarah match hoti hain: peer jo bhi combination accept kare theek hai. IKEv1 mein policy tabhi match hoti hai jab encryption, hash, authentication aur DH group sab identical hon. Aur PFS mismatch phase 2 problem hai, phase 1 nahi.</p></div>

<div class="scn"><h4>Woh router jo raat bhar mein harden hua</h4><p>Ticket INC-9310: branch team ne BR1 ko SHA-384 aur group 20 par harden kiya, aur HQ tak tunnel mar gaya. NK-FTD abhi bhi sirf SHA-256 aur group 14 wali custom policy NK-IKE-HQ use kar raha tha. Log ne dikhaya <code>Negotiation aborted due to ERROR: Received no proposal chosen notify</code>. Engineer ne BR1 ka proposal padha, NK-IKE-HQ ko SHA-384 integrity aur PRF aur DH group 20 shaamil karne ke liye edit kiya (baaki branches ke liye purani values rakhte hue), deploy kiya, aur error negotiation ke agle stage mein badal gaya, jise usne phir theek kiya.</p><p><b>Lesson:</b> jab kai peers ek policy share karte hain, to purani values replace karne ki jagah nayi values add karo.</p></div>

<div class="iv"><p class="q">"Aapka partner AES-GCM chahta hai. Threat Defense par kya configure karoge, aur AES-CBC se kya alag hai?"</p><p>AES-GCM-256, integrity NULL, SHA-384 jaisa PRF aur 20 jaisa DH group wali IKEv2 policy banao, aur ESP AES-GCM-256 aur hash NULL wala IKEv2 IPsec proposal. Samjhao ki GCM AEAD hai (ek step mein encryption plus authentication tag), isliye alag HMAC use nahi hota, par IKE ko keys derive karne ke liye phir bhi PRF chahiye. Priority order, dono sides par matching PFS, aur <code>show vpn-sessiondb l2l</code> se verify karna mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IKEv2 policies aur IPsec proposals Objects → VPN Objects mein global objects hain; system objects locked hain.</li>
<li>Kam priority number = pehle offer; IKEv2 ko ek acceptable combination chahiye, IKEv1 ko exact match.</li>
<li>AES-GCM: IKE mein integrity NULL plus PRF, IPsec mein ESP hash NULL; ek IKEv2 policy mein GCM aur CBC kabhi mix mat karo.</li>
<li>Authentication pre-shared manual key ya certificates hai; failures AUTHENTICATION_FAILED ki tarah dikhte hain.</li>
<li>PFS ka apna Modulus Group hai aur dono peers par match hona chahiye.</li>
</ul></div>
`}};export{e as default};