var e={id:`ipsec-ikev2`,h:{en:`IPsec and IKEv2 refresher for the Threat Defense`,hi:`Threat Defense ke liye IPsec aur IKEv2 refresher`},body:{en:`
<p>Before we click through the Management Center, we need a shared language. This chapter is a fast refresher of the IPsec pieces you met in the ASA VPN module, with the Threat Defense names attached to each one. If a term feels new, go back to that module; here we focus on what you will select in the GUI and what you will read in the CLI.</p>

<h3>Two phases: first a safe meeting room, then the delivery trucks</h3>
<p>Think again of the two office managers. First they need a private meeting room where nobody can listen: that is the <b>IKE SA</b> (phase 1 in IKEv1 language). Inside that room they agree on the details of the delivery trucks: those are the <b>IPsec SAs</b>, also called <b>child SAs</b> (phase 2). The trucks carry user data; the meeting room only carries control messages such as rekeys and dead peer detection.</p>

<dl class="terms">
<dt>ESP</dt><dd>Encapsulating Security Payload, IP protocol 50. Encrypts and authenticates the packet. AH (protocol 51) only authenticates and breaks with NAT, so you will not use it.</dd>
<dt>Tunnel mode</dt><dd>The whole original packet is wrapped inside a new IP header between the two gateways. This is what site-to-site VPNs on a Threat Defense use.</dd>
<dt>SA and SPI</dt><dd>A security association is one direction of keys and algorithms. Each has a 32-bit Security Parameter Index. A working tunnel has one IKE SA and at least one pair of IPsec SAs (inbound and outbound).</dd>
<dt>Traffic selectors</dt><dd>The source and destination networks a child SA protects. On a policy-based VPN they come from the protected networks you select (the crypto ACL).</dd>
<dt>PFS</dt><dd>Perfect Forward Secrecy: a fresh Diffie-Hellman exchange for each child SA, so a stolen IKE key does not expose old traffic.</dd>
</dl>

<h3>IKEv2 in four exchanges</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="IKEv2 exchanges">
<rect x="20" y="10" width="140" height="34" rx="8" fill="#fed7aa"/><text x="90" y="32" text-anchor="middle" class="svg-ink" font-size="13">NK-FTD (initiator)</text>
<rect x="480" y="10" width="140" height="34" rx="8" fill="#bae6fd"/><text x="550" y="32" text-anchor="middle" class="svg-ink" font-size="13">BR1 (responder)</text>
<line x1="90" y1="44" x2="90" y2="220" stroke="#64748b"/><line x1="550" y1="44" x2="550" y2="220" stroke="#64748b"/>
<line x1="90" y1="70" x2="550" y2="70" stroke="#64748b"/><text x="320" y="64" text-anchor="middle" class="svg-ink" font-size="12">IKE_SA_INIT: proposals, DH, nonces (clear text)</text>
<line x1="550" y1="95" x2="90" y2="95" stroke="#64748b"/><text x="320" y="89" text-anchor="middle" class="svg-muted" font-size="12">chosen proposal or NO_PROPOSAL_CHOSEN</text>
<line x1="90" y1="130" x2="550" y2="130" stroke="#64748b"/><text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="12">IKE_AUTH: identity, PSK proof, TSi/TSr (encrypted)</text>
<line x1="550" y1="155" x2="90" y2="155" stroke="#64748b"/><text x="320" y="149" text-anchor="middle" class="svg-muted" font-size="12">AUTHENTICATION_FAILED or TS_UNACCEPTABLE</text>
<line x1="90" y1="190" x2="550" y2="190" stroke="#0284c7" stroke-dasharray="5 4"/><text x="320" y="184" text-anchor="middle" class="svg-accent" font-size="12">CREATE_CHILD_SA (rekey, PFS) · INFORMATIONAL (DPD)</text>
</svg><p class="cap">Where each IKEv2 error appears. Knowing the exchange tells you which setting to compare.</p></div>
<ol><li><b>IKE_SA_INIT</b> (two messages, clear text): the initiator offers its IKEv2 proposals (encryption, integrity, PRF, DH group), a key-exchange payload, a nonce and NAT detection hashes. If the responder accepts none, it answers <code>NO_PROPOSAL_CHOSEN</code>.</li>
<li><b>IKE_AUTH</b> (two messages, encrypted): identities, proof of the pre-shared key or a certificate signature, the first child SA proposal and the traffic selectors. A wrong key gives <code>AUTHENTICATION_FAILED</code>; selectors that do not match the peer's protected networks give <code>TS_UNACCEPTABLE</code>.</li>
<li><b>CREATE_CHILD_SA</b>: extra child SAs and rekeys; with PFS a new DH exchange happens here.</li>
<li><b>INFORMATIONAL</b>: dead peer detection, deletes and error notifications.</li></ol>
<p>IKEv1 needed six Main Mode plus three Quick Mode messages and demanded an exact policy match. The Threat Defense still supports IKEv1 for old peers, but IKEv2 is what you configure for new tunnels.</p>

<h3>Choosing algorithms: Next-Generation Encryption</h3>
<table class="cmp"><tr><th>Purpose</th><th>Use</th><th>Avoid</th></tr>
<tr><td>Encryption</td><td>AES-GCM-256, AES-256 (CBC)</td><td>DES, 3DES</td></tr>
<tr><td>Integrity / PRF</td><td>SHA-256, SHA-384, SHA-512</td><td>MD5, SHA-1 for new designs</td></tr>
<tr><td>Diffie-Hellman</td><td>groups 19, 20, 21 (elliptic curve) or 14 to 16</td><td>groups 1, 2, 5</td></tr></table>
<p><b>AES-GCM</b> is an AEAD cipher: it encrypts and authenticates in one operation. So an IKEv2 policy using AES-GCM sets integrity to <b>NULL</b> but still needs a <b>PRF</b> (pseudo-random function, for example SHA-384) to derive keys, and an IPsec proposal using AES-GCM sets the ESP hash to NULL. The Management Center refuses to mix GCM and CBC ciphers in one IKEv2 policy object.</p>

<h3>NAT traversal</h3>
<p>ESP has no port numbers, so a PAT device in the path cannot translate it. The NAT detection hashes in IKE_SA_INIT reveal whether an address was changed; if so both peers move from UDP 500 to <b>UDP 4500</b>, wrap ESP in UDP and send keepalives. In <code>show crypto ikev2 sa detail</code> look for "NAT-T is detected" or "not detected".</p>

<div class="eg"><p><b>Worked example.</b> NK-FTD offers the system policy AES-SHA-SHA-LATEST (AES-256/192/128, SHA-512 to SHA-1, DH 21 to 14). BR1 offers AES-CBC-256, SHA-256, group 14. The overlap is AES-256, SHA-256, PRF SHA-256, group 14, so the IKE SA comes up with exactly that. On the Threat Defense you would see:</p>
<pre class="out">&gt; show crypto ikev2 sa

IKEv2 SAs:

Session-id:1, Status:UP-ACTIVE, IKE count:1, CHILD count:1

Tunnel-id Local                Remote               Status   Role
        1 203.0.113.2/500      198.51.100.2/500     READY    INITIATOR
      <span class="hl">Encr: AES-CBC, keysize: 256, Hash: SHA256, DH Grp:14, Auth sign: PSK, Auth verify: PSK</span>
      Life/Active Time: 86400/42 sec
Child sa: local selector  10.0.1.0/0 - 10.0.1.255/65535
          remote selector 10.20.0.0/0 - 10.20.0.255/65535
          ESP spi in/out: 0x5c2a91d3/0x9b41e07a</pre></div>

<div class="warn"><p><b>Common mistakes.</b> Choosing integrity SHA-256 together with AES-GCM (the GUI rejects it, a CLI peer may silently fail); forgetting that both sides need at least one identical proposal; enabling PFS on one side only, which breaks the child SA with <code>NO_PROPOSAL_CHOSEN</code> during CREATE_CHILD_SA or IKE_AUTH.</p></div>

<div class="exam"><p><b>Exam trap.</b> "The IKE SA is up but there is no IPsec SA" is never a key or proposal problem for the IKE SA: authentication already worked. Look at the traffic selectors (protected networks) or the IPsec proposal and PFS. And remember: IKE_SA_INIT is the only clear-text exchange.</p></div>

<div class="scn"><h4>The audit that killed SHA-1</h4><p>An internal audit flagged 30 partner tunnels still using 3DES and SHA-1. The engineer could not change all partners in one night, so she created a new IKEv2 policy with AES-GCM-256, PRF SHA-384 and DH group 20 at priority 1, and kept the old policy at a lower priority. Each partner negotiated the strongest common proposal; as partners upgraded, <code>show vpn-sessiondb l2l</code> showed AES-GCM-256 for them automatically. After 60 days she removed the legacy policy and the last two partners who had not upgraded raised tickets, exactly as planned.</p><p><b>Lesson:</b> IKEv2 offers several proposals in priority order, which makes gradual migration safe.</p></div>

<div class="iv"><p class="q">"Walk me through IKEv2 and tell me where it can fail."</p><p>Name the exchanges in order: IKE_SA_INIT negotiates algorithms and DH in clear text (fails with NO_PROPOSAL_CHOSEN), IKE_AUTH authenticates with PSK or certificates and creates the first child SA (fails with AUTHENTICATION_FAILED or TS_UNACCEPTABLE), CREATE_CHILD_SA handles rekeys and PFS, INFORMATIONAL carries DPD. Add that AES-GCM uses integrity NULL with a separate PRF, and that NAT-T moves to UDP 4500.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One IKE SA protects control traffic; pairs of IPsec (child) SAs carry data, each identified by an SPI.</li>
<li>IKE_SA_INIT → proposals and DH; IKE_AUTH → authentication and selectors; CREATE_CHILD_SA → rekey and PFS.</li>
<li>NO_PROPOSAL_CHOSEN, AUTHENTICATION_FAILED and TS_UNACCEPTABLE each point to a different setting.</li>
<li>Prefer AES-GCM-256 or AES-256, SHA-2, DH 19 to 21 or 14 to 16; AES-GCM uses integrity NULL plus a PRF.</li>
<li>NAT-T wraps ESP in UDP 4500 when a NAT device is detected.</li>
</ul></div>
`,hi:`
<p>Management Center mein click karne se pehle hume ek common language chahiye. Yeh chapter un IPsec pieces ka fast refresher hai jo aapne ASA VPN module mein dekhe, har ek ke saath Threat Defense ka naam joda gaya hai. Agar koi term naya lage, us module par wapas jao; yahan hum us par focus karte hain jo aap GUI mein select karoge aur CLI mein padhoge.</p>

<h3>Do phases: pehle safe meeting room, phir delivery trucks</h3>
<p>Phir se do office managers ko socho. Pehle unhe ek private meeting room chahiye jahan koi sun na sake: yeh <b>IKE SA</b> hai (IKEv1 ki bhasha mein phase 1). Us room ke andar woh delivery trucks ki details tay karte hain: yeh <b>IPsec SAs</b> hain, jinhe <b>child SAs</b> bhi kehte hain (phase 2). Trucks user data le jaate hain; meeting room sirf control messages le jaata hai jaise rekeys aur dead peer detection.</p>

<dl class="terms">
<dt>ESP</dt><dd>Encapsulating Security Payload, IP protocol 50. Packet ko encrypt aur authenticate karta hai. AH (protocol 51) sirf authenticate karta hai aur NAT ke saath toot jaata hai, isliye aap use use nahi karoge.</dd>
<dt>Tunnel mode</dt><dd>Poora original packet do gateways ke beech ek naye IP header mein lapeta jaata hai. Threat Defense par site-to-site VPN yahi use karte hain.</dd>
<dt>SA aur SPI</dt><dd>Security association keys aur algorithms ki ek direction hai. Har ek ka 32-bit Security Parameter Index hota hai. Chalte tunnel mein ek IKE SA aur kam se kam ek pair IPsec SAs (inbound aur outbound) hote hain.</dd>
<dt>Traffic selectors</dt><dd>Woh source aur destination networks jinhe child SA protect karta hai. Policy-based VPN par yeh aapke select kiye protected networks (crypto ACL) se aate hain.</dd>
<dt>PFS</dt><dd>Perfect Forward Secrecy: har child SA ke liye naya Diffie-Hellman exchange, taaki chori hui IKE key purana traffic expose na kare.</dd>
</dl>

<h3>Chaar exchanges mein IKEv2</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="IKEv2 exchanges">
<rect x="20" y="10" width="140" height="34" rx="8" fill="#fed7aa"/><text x="90" y="32" text-anchor="middle" class="svg-ink" font-size="13">NK-FTD (initiator)</text>
<rect x="480" y="10" width="140" height="34" rx="8" fill="#bae6fd"/><text x="550" y="32" text-anchor="middle" class="svg-ink" font-size="13">BR1 (responder)</text>
<line x1="90" y1="44" x2="90" y2="220" stroke="#64748b"/><line x1="550" y1="44" x2="550" y2="220" stroke="#64748b"/>
<line x1="90" y1="70" x2="550" y2="70" stroke="#64748b"/><text x="320" y="64" text-anchor="middle" class="svg-ink" font-size="12">IKE_SA_INIT: proposals, DH, nonces (clear text)</text>
<line x1="550" y1="95" x2="90" y2="95" stroke="#64748b"/><text x="320" y="89" text-anchor="middle" class="svg-muted" font-size="12">chuna gaya proposal ya NO_PROPOSAL_CHOSEN</text>
<line x1="90" y1="130" x2="550" y2="130" stroke="#64748b"/><text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="12">IKE_AUTH: identity, PSK proof, TSi/TSr (encrypted)</text>
<line x1="550" y1="155" x2="90" y2="155" stroke="#64748b"/><text x="320" y="149" text-anchor="middle" class="svg-muted" font-size="12">AUTHENTICATION_FAILED ya TS_UNACCEPTABLE</text>
<line x1="90" y1="190" x2="550" y2="190" stroke="#0284c7" stroke-dasharray="5 4"/><text x="320" y="184" text-anchor="middle" class="svg-accent" font-size="12">CREATE_CHILD_SA (rekey, PFS) · INFORMATIONAL (DPD)</text>
</svg><p class="cap">Har IKEv2 error kahan dikhta hai. Exchange pata ho to pata chalta hai kaunsi setting compare karni hai.</p></div>
<ol><li><b>IKE_SA_INIT</b> (do messages, clear text): initiator apne IKEv2 proposals (encryption, integrity, PRF, DH group), key-exchange payload, nonce aur NAT detection hashes offer karta hai. Agar responder koi accept nahi karta, woh <code>NO_PROPOSAL_CHOSEN</code> jawab deta hai.</li>
<li><b>IKE_AUTH</b> (do messages, encrypted): identities, pre-shared key ka proof ya certificate signature, pehla child SA proposal aur traffic selectors. Galat key deti hai <code>AUTHENTICATION_FAILED</code>; peer ke protected networks se match na hone wale selectors dete hain <code>TS_UNACCEPTABLE</code>.</li>
<li><b>CREATE_CHILD_SA</b>: extra child SAs aur rekeys; PFS ke saath yahan naya DH exchange hota hai.</li>
<li><b>INFORMATIONAL</b>: dead peer detection, deletes aur error notifications.</li></ol>
<p>IKEv1 ko chhe Main Mode plus teen Quick Mode messages chahiye the aur exact policy match maangta tha. Threat Defense purane peers ke liye IKEv1 abhi bhi support karta hai, par naye tunnels ke liye aap IKEv2 configure karte ho.</p>

<h3>Algorithms chunna: Next-Generation Encryption</h3>
<table class="cmp"><tr><th>Purpose</th><th>Use karo</th><th>Bacho</th></tr>
<tr><td>Encryption</td><td>AES-GCM-256, AES-256 (CBC)</td><td>DES, 3DES</td></tr>
<tr><td>Integrity / PRF</td><td>SHA-256, SHA-384, SHA-512</td><td>MD5, naye designs mein SHA-1</td></tr>
<tr><td>Diffie-Hellman</td><td>groups 19, 20, 21 (elliptic curve) ya 14 se 16</td><td>groups 1, 2, 5</td></tr></table>
<p><b>AES-GCM</b> ek AEAD cipher hai: ek hi operation mein encrypt aur authenticate karta hai. Isliye AES-GCM wali IKEv2 policy integrity <b>NULL</b> set karti hai par keys derive karne ke liye phir bhi <b>PRF</b> (pseudo-random function, jaise SHA-384) chahiye, aur AES-GCM wala IPsec proposal ESP hash NULL set karta hai. Management Center ek IKEv2 policy object mein GCM aur CBC ciphers mix karne se mana karta hai.</p>

<h3>NAT traversal</h3>
<p>ESP mein port numbers nahi hote, isliye raste ka PAT device use translate nahi kar sakta. IKE_SA_INIT ke NAT detection hashes batate hain ki koi address badla gaya ya nahi; agar haan, dono peers UDP 500 se <b>UDP 4500</b> par chale jaate hain, ESP ko UDP mein lapet dete hain aur keepalives bhejte hain. <code>show crypto ikev2 sa detail</code> mein "NAT-T is detected" ya "not detected" dekho.</p>

<div class="eg"><p><b>Worked example.</b> NK-FTD system policy AES-SHA-SHA-LATEST offer karta hai (AES-256/192/128, SHA-512 se SHA-1, DH 21 se 14). BR1 offer karta hai AES-CBC-256, SHA-256, group 14. Overlap hai AES-256, SHA-256, PRF SHA-256, group 14, isliye IKE SA bilkul isi ke saath up hota hai. Threat Defense par aap dekhoge:</p>
<pre class="out">&gt; show crypto ikev2 sa

IKEv2 SAs:

Session-id:1, Status:UP-ACTIVE, IKE count:1, CHILD count:1

Tunnel-id Local                Remote               Status   Role
        1 203.0.113.2/500      198.51.100.2/500     READY    INITIATOR
      <span class="hl">Encr: AES-CBC, keysize: 256, Hash: SHA256, DH Grp:14, Auth sign: PSK, Auth verify: PSK</span>
      Life/Active Time: 86400/42 sec
Child sa: local selector  10.0.1.0/0 - 10.0.1.255/65535
          remote selector 10.20.0.0/0 - 10.20.0.255/65535
          ESP spi in/out: 0x5c2a91d3/0x9b41e07a</pre></div>

<div class="warn"><p><b>Common mistakes.</b> AES-GCM ke saath integrity SHA-256 chunna (GUI ise reject karta hai, CLI peer chupchaap fail ho sakta hai); bhool jaana ki dono sides par kam se kam ek identical proposal chahiye; PFS sirf ek side par enable karna, jo CREATE_CHILD_SA ya IKE_AUTH ke dauraan child SA ko <code>NO_PROPOSAL_CHOSEN</code> se tod deta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "IKE SA up hai par IPsec SA nahi" kabhi bhi IKE SA ke liye key ya proposal problem nahi hai: authentication pehle hi chal gaya. Traffic selectors (protected networks) ya IPsec proposal aur PFS dekho. Aur yaad rakho: IKE_SA_INIT hi akela clear-text exchange hai.</p></div>

<div class="scn"><h4>Woh audit jisne SHA-1 khatam kiya</h4><p>Ek internal audit ne 30 partner tunnels flag kiye jo abhi bhi 3DES aur SHA-1 use kar rahe the. Engineer ek raat mein saare partners nahi badal sakti thi, isliye usne AES-GCM-256, PRF SHA-384 aur DH group 20 ke saath priority 1 par ek nayi IKEv2 policy banayi, aur purani policy ko lower priority par rakha. Har partner ne strongest common proposal negotiate kiya; jaise-jaise partners upgrade hue, <code>show vpn-sessiondb l2l</code> unke liye apne aap AES-GCM-256 dikhane laga. 60 din baad usne legacy policy hata di aur jo do partners upgrade nahi hue the unhone tickets raise kiye, bilkul plan ke mutabik.</p><p><b>Lesson:</b> IKEv2 priority order mein kai proposals offer karta hai, jo gradual migration ko safe banata hai.</p></div>

<div class="iv"><p class="q">"Mujhe IKEv2 samjhao aur batao yeh kahan fail ho sakta hai."</p><p>Exchanges order mein batao: IKE_SA_INIT clear text mein algorithms aur DH negotiate karta hai (NO_PROPOSAL_CHOSEN se fail), IKE_AUTH PSK ya certificates se authenticate karta hai aur pehla child SA banata hai (AUTHENTICATION_FAILED ya TS_UNACCEPTABLE se fail), CREATE_CHILD_SA rekeys aur PFS handle karta hai, INFORMATIONAL DPD le jaata hai. Add karo ki AES-GCM alag PRF ke saath integrity NULL use karta hai, aur NAT-T UDP 4500 par shift hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek IKE SA control traffic protect karta hai; IPsec (child) SAs ke pairs data le jaate hain, har ek SPI se pehchana jaata hai.</li>
<li>IKE_SA_INIT → proposals aur DH; IKE_AUTH → authentication aur selectors; CREATE_CHILD_SA → rekey aur PFS.</li>
<li>NO_PROPOSAL_CHOSEN, AUTHENTICATION_FAILED aur TS_UNACCEPTABLE har ek alag setting ki taraf ishara karte hain.</li>
<li>AES-GCM-256 ya AES-256, SHA-2, DH 19 se 21 ya 14 se 16 prefer karo; AES-GCM integrity NULL plus PRF use karta hai.</li>
<li>NAT device detect hone par NAT-T ESP ko UDP 4500 mein lapet deta hai.</li>
</ul></div>
`}};export{e as default};