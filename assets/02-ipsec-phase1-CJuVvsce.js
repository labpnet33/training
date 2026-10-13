var e={id:`ipsec-phase1`,h:{en:`Phase 1 options that matter: IKE version, proposals, DH, peer identity`,hi:`Phase 1 ke zaroori options: IKE version, proposals, DH, peer identity`},body:{en:`
<p>A phase 1 is a contract with a single question per clause: "do we agree?" If any clause differs, the peers refuse each other and the tunnel never starts. In FortiOS 7.6 the object lives under <code>config vpn ipsec phase1-interface</code>. This chapter explains the options that decide whether Kaveri Retail's Trichy branch can talk to the Chennai hub, and it prepares tasks 1 and 3 of lab <b>n7-ipsec-hub</b> and all of <b>n7-ipsec-down</b>.</p>

<h3>The options, one by one</h3>
<ul>
<li><b>type</b>: <code>static</code> (we know the peer's address, <code>remote-gw</code>) or <code>dynamic</code> (we wait for any peer; the hub). A third kind, <code>ddns</code>, resolves a name. The type is about <i>who initiates</i>, not about crypto.</li>
<li><b>interface</b>: the physical or logical interface that sends and receives IKE (port1, the WAN).</li>
<li><b>ike-version</b>: 1 or 2. Both peers must use the same. IKEv2 is the default in the labs.</li>
<li><b>proposal</b>: a list such as <code>aes256-sha256</code> (encryption-hash). The peers need at least one in common.</li>
<li><b>dhgrp</b>: the Diffie-Hellman group (for example 14 = 2048-bit MODP, 19 = 256-bit ECP). At least one in common.</li>
<li><b>psksecret</b>: the pre-shared key. Minimum 6 characters.</li>
<li><b>peertype</b>: which peer identities are accepted (<code>any</code>, <code>one</code> with <code>peerid</code>, or a group).</li>
<li><b>net-device</b>: <code>enable</code> on a spoke creates one fixed tunnel interface; <code>disable</code> on a dial-up hub keeps a single template with instances (chapter 5).</li>
<li><b>dpd</b>: dead peer detection (<code>on-idle</code> sends probes only when traffic is waiting).</li>
</ul>

<div class="dia"><svg viewBox="0 0 660 215" role="img" aria-label="Phase 1 parameter match">
<rect x="20" y="30" width="270" height="150" rx="10" fill="#bae6fd"/><text x="155" y="55" text-anchor="middle" class="svg-ink" font-size="14">TRY-FGT TO-HQ</text>
<text x="155" y="80" text-anchor="middle" class="svg-muted" font-size="12">ike-version 2</text><text x="155" y="100" text-anchor="middle" class="svg-muted" font-size="12">proposal aes128-sha1</text><text x="155" y="120" text-anchor="middle" class="svg-muted" font-size="12">dhgrp 14</text><text x="155" y="140" text-anchor="middle" class="svg-muted" font-size="12">psksecret Kaveri-IPSec-2026</text>
<rect x="370" y="30" width="270" height="150" rx="10" fill="#ddd6fe"/><text x="505" y="55" text-anchor="middle" class="svg-ink" font-size="14">HQ-FGT KR-ADVPN</text>
<text x="505" y="80" text-anchor="middle" class="svg-muted" font-size="12">ike-version 2</text><text x="505" y="100" text-anchor="middle" class="svg-muted" font-size="12">proposal aes256-sha256</text><text x="505" y="120" text-anchor="middle" class="svg-muted" font-size="12">dhgrp 14</text><text x="505" y="140" text-anchor="middle" class="svg-muted" font-size="12">psksecret Kaveri-IPsec-2026</text>
<text x="330" y="100" text-anchor="middle" class="svg-accent" font-size="22">≠</text>
<text x="330" y="200" text-anchor="middle" class="svg-ink" font-size="12">proposal differs first (NO_PROPOSAL_CHOSEN), then the key (AUTHENTICATION_FAILED)</text>
</svg><p class="cap">The ticket KR-2310 faults in one picture: matching is checked clause by clause.</p></div>

<h3>Order of checks and the notify you see</h3>
<p>In IKEv2 the exchange fails at the first clause that does not match, and the responder tells you with a <b>notify</b> message. This order is the base of troubleshooting:</p>
<ol>
<li>Underlay and policy: no answer at all, or "ignoring IKE request, no policy configured".</li>
<li>IKE version: a v1 request to a v2-only gateway is not understood.</li>
<li>Proposals and DH, in IKE_SA_INIT: <code>NO_PROPOSAL_CHOSEN</code>. Both lists are printed in the debug, so you can read the difference.</li>
<li>Identity and key, in IKE_AUTH: <code>AUTHENTICATION_FAILED</code>. It never tells you which character is wrong.</li>
<li>Phase 2 (next chapter): <code>NO_PROPOSAL_CHOSEN</code> again (PFS or proposal) or <code>TS_UNACCEPTABLE</code> (selectors).</li>
</ol>
<pre class="out">TRY-FGT # diagnose debug application ike -1
ike 0:TO-HQ:0: sent IKE msg (SA_INIT): 203.0.113.12:500-&gt;203.0.113.1:500
ike 0:TO-HQ:0: <span class="hl">my proposal: aes128-sha1  / incoming: aes256-sha256, DH MODP2048</span>
ike 0:TO-HQ:0: <span class="hl">received notify type NO_PROPOSAL_CHOSEN</span></pre>

<h3>Peer identity</h3>
<p>With <code>peertype any</code> the gateway accepts every identity once the key matches, which is simple and fine for a hub that serves many spokes. With <code>peertype one</code> plus <code>peerid</code> the gateway also insists that the remote identifier equals the configured value. Combine it with <code>localid</code> on the other side. A mismatch is logged as a peer-ID error even though the key is right. Chapter 6 develops identities and the key more.</p>

<h3>Configuring it right the first time</h3>
<pre class="code">config vpn ipsec phase1-interface
    edit "KR-ADVPN"
        set type dynamic
        set interface "port1"
        set ike-version 2
        set peertype any
        set net-device disable
        set proposal aes256-sha256
        set dpd on-idle
        set dhgrp 14
        set psksecret Kaveri-IPsec-2026
    next
end</pre>
<p>Use <code>show full-configuration vpn ipsec phase1-interface TO-HQ</code> to see every value including defaults, and <code>diagnose vpn ike gateway list name TO-HQ</code> to see the negotiated result (version, proposal, DH, age).</p>
<div class="warn"><p><b>Common mistake.</b> Changing a phase 1 option on a live tunnel and expecting it to adopt the new value. An established IKE SA keeps its old parameters. Clear it with <code>diagnose vpn ike gateway clear name TO-HQ</code> so a new negotiation uses the new settings.</p></div>
<div class="exam"><p><b>Exam trap.</b> The proposal list is matched as a set, not by position: one common entry is enough. But the pre-shared key is compared exactly, including case: "Kaveri-IPSec-2026" and "Kaveri-IPsec-2026" are different keys.</p></div>

<div class="scn"><h4>One capital letter</h4><p>After a change window the Trichy tunnel stayed down. The proposals were fixed already, yet the hub log said AUTHENTICATION_FAILED. A colleague had retyped the key and capitalised an S. Because FortiOS never reveals which character differs, the team re-entered the key on both ends from the password manager and the tunnel came up in seconds.</p><p><b>Lesson:</b> the key is exact; paste it, do not retype it.</p></div>

<div class="iv"><p class="q">"What does NO_PROPOSAL_CHOSEN mean?"</p><p>The responder found no common encryption/hash/DH combination between the lists, in phase 1 or in the phase 2 child SA. Say that you read both proposal lists in the IKE debug and then align them, and that for phase 2 a PFS mismatch gives the same notify.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>type decides who initiates; ike-version, proposal, dhgrp and the key must match.</li>
<li>NO_PROPOSAL_CHOSEN = proposals or DH; AUTHENTICATION_FAILED = key or identity.</li>
<li>peertype any is fine on a dial-up hub; peertype one adds a peer-ID check.</li>
<li>Existing IKE SAs keep old parameters until cleared.</li>
<li>The pre-shared key is case sensitive and exact.</li>
</ul></div>
`,hi:`
<p>Phase 1 ek contract hai jisme har clause ek hi sawaal poochta hai: "kya hum sahmat hain?" Koi bhi clause alag hua to peers ek-dusre ko mana kar dete hain aur tunnel start hi nahi hota. FortiOS 7.6 mein yeh object <code>config vpn ipsec phase1-interface</code> ke neeche hota hai. Yeh chapter un options ko samjhata hai jo tay karte hain ki Kaveri Retail ka Trichy branch Chennai hub se baat kar sakega ya nahi, aur lab <b>n7-ipsec-hub</b> ke tasks 1 aur 3 tathaa poore <b>n7-ipsec-down</b> ki taiyari karata hai.</p>

<h3>Options, ek-ek karke</h3>
<ul>
<li><b>type</b>: <code>static</code> (peer ka address pata hai, <code>remote-gw</code>) ya <code>dynamic</code> (koi bhi peer aaye, hum intezaar karte hain; hub). Teesra <code>ddns</code> naam resolve karta hai. Type yeh batata hai ki <i>kaun initiate karega</i>, crypto ke baare mein nahi.</li>
<li><b>interface</b>: woh interface jo IKE bhejta aur leta hai (port1, WAN).</li>
<li><b>ike-version</b>: 1 ya 2. Dono peers ko same chahiye. Labs mein default IKEv2 hai.</li>
<li><b>proposal</b>: <code>aes256-sha256</code> jaisi list (encryption-hash). Peers ke paas kam se kam ek common hona chahiye.</li>
<li><b>dhgrp</b>: Diffie-Hellman group (jaise 14 = 2048-bit MODP, 19 = 256-bit ECP). Kam se kam ek common.</li>
<li><b>psksecret</b>: pre-shared key. Minimum 6 characters.</li>
<li><b>peertype</b>: kaunsi peer identities accept hongi (<code>any</code>, <code>one</code> aur <code>peerid</code> ke saath, ya group).</li>
<li><b>net-device</b>: spoke par <code>enable</code> ek fixed tunnel interface banata hai; dial-up hub par <code>disable</code> ek template rakhta hai jiske instances hote hain (chapter 5).</li>
<li><b>dpd</b>: dead peer detection (<code>on-idle</code> sirf tab probe bhejta hai jab traffic ruka ho).</li>
</ul>

<div class="dia"><svg viewBox="0 0 660 215" role="img" aria-label="Phase 1 parameter match">
<rect x="20" y="30" width="270" height="150" rx="10" fill="#bae6fd"/><text x="155" y="55" text-anchor="middle" class="svg-ink" font-size="14">TRY-FGT TO-HQ</text>
<text x="155" y="80" text-anchor="middle" class="svg-muted" font-size="12">ike-version 2</text><text x="155" y="100" text-anchor="middle" class="svg-muted" font-size="12">proposal aes128-sha1</text><text x="155" y="120" text-anchor="middle" class="svg-muted" font-size="12">dhgrp 14</text><text x="155" y="140" text-anchor="middle" class="svg-muted" font-size="12">psksecret Kaveri-IPSec-2026</text>
<rect x="370" y="30" width="270" height="150" rx="10" fill="#ddd6fe"/><text x="505" y="55" text-anchor="middle" class="svg-ink" font-size="14">HQ-FGT KR-ADVPN</text>
<text x="505" y="80" text-anchor="middle" class="svg-muted" font-size="12">ike-version 2</text><text x="505" y="100" text-anchor="middle" class="svg-muted" font-size="12">proposal aes256-sha256</text><text x="505" y="120" text-anchor="middle" class="svg-muted" font-size="12">dhgrp 14</text><text x="505" y="140" text-anchor="middle" class="svg-muted" font-size="12">psksecret Kaveri-IPsec-2026</text>
<text x="330" y="100" text-anchor="middle" class="svg-accent" font-size="22">≠</text>
<text x="330" y="200" text-anchor="middle" class="svg-ink" font-size="12">pehle proposal alag (NO_PROPOSAL_CHOSEN), phir key (AUTHENTICATION_FAILED)</text>
</svg><p class="cap">Ticket KR-2310 ke faults ek tasveer mein: matching clause-by-clause check hoti hai.</p></div>

<h3>Checks ka order aur dikhne wala notify</h3>
<p>IKEv2 mein exchange pehle us clause par fail hota hai jo match nahi karta, aur responder <b>notify</b> message se batata hai. Troubleshooting ka base yahi order hai:</p>
<ol>
<li>Underlay aur policy: koi jawab hi nahi, ya "ignoring IKE request, no policy configured".</li>
<li>IKE version: v1 request ko v2-only gateway samajhta nahi.</li>
<li>IKE_SA_INIT mein proposals aur DH: <code>NO_PROPOSAL_CHOSEN</code>. Debug mein dono lists print hoti hain, isliye farq padh sakte ho.</li>
<li>IKE_AUTH mein identity aur key: <code>AUTHENTICATION_FAILED</code>. Yeh kabhi nahi batata ki kaunsa character galat hai.</li>
<li>Phase 2 (agla chapter): phir <code>NO_PROPOSAL_CHOSEN</code> (PFS ya proposal) ya <code>TS_UNACCEPTABLE</code> (selectors).</li>
</ol>
<pre class="out">TRY-FGT # diagnose debug application ike -1
ike 0:TO-HQ:0: sent IKE msg (SA_INIT): 203.0.113.12:500-&gt;203.0.113.1:500
ike 0:TO-HQ:0: <span class="hl">my proposal: aes128-sha1  / incoming: aes256-sha256, DH MODP2048</span>
ike 0:TO-HQ:0: <span class="hl">received notify type NO_PROPOSAL_CHOSEN</span></pre>

<h3>Peer identity</h3>
<p><code>peertype any</code> ke saath key match hote hi gateway har identity accept karta hai, jo simple hai aur bahut spokes serve karne wale hub ke liye theek hai. <code>peertype one</code> aur <code>peerid</code> ke saath gateway yeh bhi maangta hai ki remote identifier configured value ke barabar ho. Dusri taraf <code>localid</code> ke saath milao. Key sahi ho tab bhi mismatch par peer-ID error log hota hai. Chapter 6 identities aur key ko aur khol kar batata hai.</p>

<h3>Pehli baar mein sahi configure karna</h3>
<pre class="code">config vpn ipsec phase1-interface
    edit "KR-ADVPN"
        set type dynamic
        set interface "port1"
        set ike-version 2
        set peertype any
        set net-device disable
        set proposal aes256-sha256
        set dpd on-idle
        set dhgrp 14
        set psksecret Kaveri-IPsec-2026
    next
end</pre>
<p>Defaults samet har value dekhne ke liye <code>show full-configuration vpn ipsec phase1-interface TO-HQ</code> aur negotiated result (version, proposal, DH, age) ke liye <code>diagnose vpn ike gateway list name TO-HQ</code> use karo.</p>
<div class="warn"><p><b>Common mistake.</b> Live tunnel par phase 1 option badalna aur sochna ki woh nayi value le lega. Established IKE SA purane parameters rakhta hai. <code>diagnose vpn ike gateway clear name TO-HQ</code> se clear karo taaki nayi negotiation nayi settings use kare.</p></div>
<div class="exam"><p><b>Exam trap.</b> Proposal list set ki tarah match hoti hai, position se nahi: ek common entry kaafi hai. Lekin pre-shared key exactly compare hoti hai, case samet: "Kaveri-IPSec-2026" aur "Kaveri-IPsec-2026" alag keys hain.</p></div>

<div class="scn"><h4>Ek capital letter</h4><p>Change window ke baad Trichy tunnel down raha. Proposals pehle hi theek kar diye gaye the, phir bhi hub log AUTHENTICATION_FAILED dikha raha tha. Ek colleague ne key dobara type ki thi aur S capital kar diya tha. FortiOS kabhi nahi batata ki kaunsa character alag hai, isliye team ne password manager se dono ends par key dobara daali aur tunnel kuch second mein up ho gaya.</p><p><b>Lesson:</b> key exact hoti hai; paste karo, dobara type mat karo.</p></div>

<div class="iv"><p class="q">"NO_PROPOSAL_CHOSEN ka matlab kya hai?"</p><p>Responder ko phase 1 ya phase 2 child SA mein dono lists ke beech koi common encryption/hash/DH combination nahi mila. Batao ki aap IKE debug mein dono proposal lists padhte ho aur unhe align karte ho, aur phase 2 mein PFS mismatch bhi yahi notify deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>type tay karta hai kaun initiate kare; ike-version, proposal, dhgrp aur key match hone chahiye.</li>
<li>NO_PROPOSAL_CHOSEN = proposals ya DH; AUTHENTICATION_FAILED = key ya identity.</li>
<li>Dial-up hub par peertype any theek hai; peertype one peer-ID check jodta hai.</li>
<li>Existing IKE SAs clear hone tak purane parameters rakhte hain.</li>
<li>Pre-shared key case sensitive aur exact hoti hai.</li>
</ul></div>
`}};export{e as default};