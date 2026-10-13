var e={id:`ipsec-phase2`,h:{en:`Phase 2: selectors, PFS and proposals`,hi:`Phase 2: selectors, PFS aur proposals`},body:{en:`
<p>Once the two FortiGates trust each other (phase 1), they agree on <i>what to protect</i>. That is phase 2: the child SA. If phase 1 is the handshake at the shop door, phase 2 is the list on the courier box: "parcels from 10.30.0.0/24 to 10.10.0.0/24 may travel". This chapter prepares lab <b>n7-ipsec-hub</b> tasks 1 and 3 and the last fault of <b>n7-ipsec-down</b>.</p>

<h3>The phase 2 object</h3>
<pre class="code">config vpn ipsec phase2-interface
    edit "TO-HQ-P2"
        set phase1name "TO-HQ"
        set proposal aes256-sha256
        set pfs enable
        set src-addr-type subnet
        set dst-addr-type subnet
        set src-subnet 0.0.0.0 0.0.0.0
        set dst-subnet 0.0.0.0 0.0.0.0
    next
end</pre>
<ul>
<li><b>phase1name</b> ties it to a phase 1. Several phase 2s can hang off one phase 1.</li>
<li><b>proposal</b>: encryption and authentication of ESP. A common entry is needed.</li>
<li><b>pfs</b> (perfect forward secrecy): when enabled each child SA runs a fresh Diffie-Hellman exchange, so a stolen long-term secret cannot decrypt past traffic. It is <b>enabled by default</b>, and both sides must agree.</li>
<li><b>selectors</b> (also called proxy IDs): <code>src-subnet</code>/<code>dst-subnet</code> (or address objects/names). Default 0.0.0.0/0 both ways means "any traffic".</li>
</ul>

<h3>Why 0.0.0.0/0 is the norm on FortiGate</h3>
<p>In route-based IPsec the <i>routing table</i> decides what enters the tunnel, and the <i>firewall policy</i> decides if it may. The selector only has to be wide enough not to block either. With 0.0.0.0/0 on both sides it never does, so one phase 2 serves any number of networks and BGP can add routes later without touching the VPN. Narrow selectors (for example 10.30.0.0/24 to 10.10.0.0/24) are needed only when the other end is not a FortiGate, or is policy-based, and requires exact proxy IDs.</p>
<div class="dia"><svg viewBox="0 0 660 220" role="img" aria-label="Selector matching">
<rect x="20" y="40" width="250" height="120" rx="10" fill="#bae6fd"/><text x="145" y="65" text-anchor="middle" class="svg-ink" font-size="14">Spoke TO-HQ-P2</text><text x="145" y="92" text-anchor="middle" class="svg-muted" font-size="12">src 10.30.0.0/24</text><text x="145" y="112" text-anchor="middle" class="svg-muted" font-size="12">dst 10.10.0.0/24</text><text x="145" y="140" text-anchor="middle" class="svg-muted" font-size="12">proposal aes256-sha256, pfs enable</text>
<rect x="390" y="40" width="250" height="120" rx="10" fill="#ddd6fe"/><text x="515" y="65" text-anchor="middle" class="svg-ink" font-size="14">Hub KR-P2</text><text x="515" y="92" text-anchor="middle" class="svg-muted" font-size="12">src 10.10.0.0/24 (mirror)</text><text x="515" y="112" text-anchor="middle" class="svg-muted" font-size="12">dst 10.30.0.0/24</text><text x="515" y="140" text-anchor="middle" class="svg-muted" font-size="12">proposal aes256-sha256, pfs enable</text>
<line x1="270" y1="100" x2="390" y2="100" stroke="#22c55e" stroke-width="4"/><text x="330" y="92" text-anchor="middle" class="svg-accent" font-size="12">mirrored</text>
<text x="330" y="200" text-anchor="middle" class="svg-ink" font-size="12">Mismatch: TS_UNACCEPTABLE. Hub 0.0.0.0/0 on a dial-up phase 2 accepts anything.</text>
</svg><p class="cap">The initiator's source is the responder's destination; selectors must mirror each other.</p></div>

<h3>How a mismatch looks</h3>
<table class="tbl"><tr><th>Cause</th><th>Notify in the debug</th><th>Symptom</th></tr>
<tr><td>no common ESP proposal</td><td>NO_PROPOSAL_CHOSEN</td><td>phase 1 up, selectors 1/0</td></tr>
<tr><td>PFS enabled on one side only (or different DH group)</td><td>NO_PROPOSAL_CHOSEN (PFS or DH group mismatch in phase 2)</td><td>same</td></tr>
<tr><td>selectors do not mirror</td><td>TS_UNACCEPTABLE</td><td>same</td></tr></table>
<pre class="out">TRY-FGT # get vpn ipsec tunnel summary
'TO-HQ' 203.0.113.1:0  <span class="hl">selectors(total,up): 1/0</span>  rx(pkt,err): 0/0  tx(pkt,err): 0/0
TRY-FGT # diagnose debug application ike -1
ike 0:TO-HQ:TO-HQ-P2: <span class="hl">received notify type NO_PROPOSAL_CHOSEN (PFS or DH group mismatch in phase 2)</span></pre>
<p>The first number in <code>selectors(total,up)</code> is how many phase 2s are configured, the second how many are up. A tunnel interface is usable when at least one is up.</p>

<h3>The hub side is a template</h3>
<p>On the dial-up hub the phase 2 <code>KR-P2</code> keeps the defaults, 0.0.0.0/0 both ways, with PFS enabled. Because the responder accepts any proposed traffic selector, every spoke can use the same phase 2 whatever its LAN is. If a spoke disables PFS the hub rejects it, exactly as in ticket KR-2310 (fault three). Fix on the spoke: <code>config vpn ipsec phase2-interface</code>, <code>edit "TO-HQ-P2"</code>, <code>set pfs enable</code>.</p>
<div class="warn"><p><b>Common mistake.</b> Turning PFS off to "make it work". It hides a real mismatch and weakens security. Align both sides and keep PFS on, unless a documented limitation of the peer forces otherwise.</p></div>
<div class="exam"><p><b>Exam trap.</b> The IKE debug for a PFS mismatch and for a proposal mismatch look alike. Look at the phase 2 name in the log line, and check <code>show full-configuration vpn ipsec phase2-interface</code> on both sides for <code>pfs</code>, <code>dhgrp</code> and <code>proposal</code>.</p></div>

<div class="scn"><h4>After the acquisition</h4><p>Kaveri bought a small chain and connected its Salem shop to a third-party router that insisted on proxy ID 10.40.0.0/24 to 10.10.0.0/24. The FortiGate had 0.0.0.0/0. Phase 1 came up, phase 2 failed with TS_UNACCEPTABLE. The fix was a second phase 2 with exactly the two subnets, not a change on the router.</p><p><b>Lesson:</b> wide selectors are for FortiGate-to-FortiGate; for other vendors, mirror their proxy IDs.</p></div>

<div class="iv"><p class="q">"Why do FortiGate tunnels usually use 0.0.0.0/0 selectors?"</p><p>Because routing and firewall policy already control what enters the tunnel; wide selectors keep the VPN independent of the networks behind it so BGP or static routes can change freely. Mention you narrow them only for interoperability with policy-based peers.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Phase 2 = child SA: proposal, PFS, selectors.</li>
<li>PFS is on by default and both ends must agree.</li>
<li>0.0.0.0/0 selectors are normal for route-based FortiGate tunnels.</li>
<li>selectors(total,up) 1/0 means phase 1 is fine, phase 2 is not.</li>
<li>TS_UNACCEPTABLE = selectors; NO_PROPOSAL_CHOSEN in phase 2 = proposal or PFS/DH.</li>
</ul></div>
`,hi:`
<p>Jab dono FortiGates ek-dusre par bharosa kar lete hain (phase 1), tab woh tay karte hain ki <i>kya protect karna hai</i>. Yeh phase 2 hai: child SA. Phase 1 dukaan ke darwaze ka handshake hai to phase 2 courier box par chipki list: "10.30.0.0/24 se 10.10.0.0/24 tak ke parcels ja sakte hain". Yeh chapter lab <b>n7-ipsec-hub</b> ke tasks 1 aur 3 tathaa <b>n7-ipsec-down</b> ke aakhri fault ki taiyari karata hai.</p>

<h3>Phase 2 object</h3>
<pre class="code">config vpn ipsec phase2-interface
    edit "TO-HQ-P2"
        set phase1name "TO-HQ"
        set proposal aes256-sha256
        set pfs enable
        set src-addr-type subnet
        set dst-addr-type subnet
        set src-subnet 0.0.0.0 0.0.0.0
        set dst-subnet 0.0.0.0 0.0.0.0
    next
end</pre>
<ul>
<li><b>phase1name</b> ise ek phase 1 se jodta hai. Ek phase 1 ke neeche kai phase 2 ho sakte hain.</li>
<li><b>proposal</b>: ESP ka encryption aur authentication. Ek common entry chahiye.</li>
<li><b>pfs</b> (perfect forward secrecy): enable ho to har child SA naya Diffie-Hellman chalata hai, isliye chori hui long-term secret purane traffic ko decrypt nahi kar sakti. Yeh <b>default mein enabled</b> hai, aur dono sides ko agree karna padta hai.</li>
<li><b>selectors</b> (proxy IDs bhi kehte hain): <code>src-subnet</code>/<code>dst-subnet</code> (ya address objects/names). Dono taraf default 0.0.0.0/0 ka matlab "koi bhi traffic".</li>
</ul>

<h3>FortiGate par 0.0.0.0/0 norm kyun hai</h3>
<p>Route-based IPsec mein <i>routing table</i> tay karti hai ki kya tunnel mein jayega, aur <i>firewall policy</i> tay karti hai ki jaa sakta hai ya nahi. Selector ko bas itna chaudaa hona chahiye ki dono ko na roke. Dono taraf 0.0.0.0/0 ho to kabhi nahi rokta, isliye ek phase 2 kitne bhi networks ko serve karta hai aur BGP baad mein VPN ko chhue bina routes jod sakta hai. Narrow selectors (jaise 10.30.0.0/24 se 10.10.0.0/24) tabhi chahiye jab doosra end FortiGate nahi hai, ya policy-based hai aur exact proxy IDs maangta hai.</p>
<div class="dia"><svg viewBox="0 0 660 220" role="img" aria-label="Selector matching">
<rect x="20" y="40" width="250" height="120" rx="10" fill="#bae6fd"/><text x="145" y="65" text-anchor="middle" class="svg-ink" font-size="14">Spoke TO-HQ-P2</text><text x="145" y="92" text-anchor="middle" class="svg-muted" font-size="12">src 10.30.0.0/24</text><text x="145" y="112" text-anchor="middle" class="svg-muted" font-size="12">dst 10.10.0.0/24</text><text x="145" y="140" text-anchor="middle" class="svg-muted" font-size="12">proposal aes256-sha256, pfs enable</text>
<rect x="390" y="40" width="250" height="120" rx="10" fill="#ddd6fe"/><text x="515" y="65" text-anchor="middle" class="svg-ink" font-size="14">Hub KR-P2</text><text x="515" y="92" text-anchor="middle" class="svg-muted" font-size="12">src 10.10.0.0/24 (mirror)</text><text x="515" y="112" text-anchor="middle" class="svg-muted" font-size="12">dst 10.30.0.0/24</text><text x="515" y="140" text-anchor="middle" class="svg-muted" font-size="12">proposal aes256-sha256, pfs enable</text>
<line x1="270" y1="100" x2="390" y2="100" stroke="#22c55e" stroke-width="4"/><text x="330" y="92" text-anchor="middle" class="svg-accent" font-size="12">mirrored</text>
<text x="330" y="200" text-anchor="middle" class="svg-ink" font-size="12">Mismatch: TS_UNACCEPTABLE. Dial-up phase 2 par hub ka 0.0.0.0/0 sab accept karta hai.</text>
</svg><p class="cap">Initiator ka source responder ka destination hota hai; selectors ek-dusre ke mirror hone chahiye.</p></div>

<h3>Mismatch kaisa dikhta hai</h3>
<table class="tbl"><tr><th>Cause</th><th>Debug mein notify</th><th>Symptom</th></tr>
<tr><td>koi common ESP proposal nahi</td><td>NO_PROPOSAL_CHOSEN</td><td>phase 1 up, selectors 1/0</td></tr>
<tr><td>PFS sirf ek side par enabled (ya alag DH group)</td><td>NO_PROPOSAL_CHOSEN (PFS or DH group mismatch in phase 2)</td><td>wahi</td></tr>
<tr><td>selectors mirror nahi karte</td><td>TS_UNACCEPTABLE</td><td>wahi</td></tr></table>
<pre class="out">TRY-FGT # get vpn ipsec tunnel summary
'TO-HQ' 203.0.113.1:0  <span class="hl">selectors(total,up): 1/0</span>  rx(pkt,err): 0/0  tx(pkt,err): 0/0
TRY-FGT # diagnose debug application ike -1
ike 0:TO-HQ:TO-HQ-P2: <span class="hl">received notify type NO_PROPOSAL_CHOSEN (PFS or DH group mismatch in phase 2)</span></pre>
<p><code>selectors(total,up)</code> ka pehla number kitne phase 2 configured hain, doosra kitne up hain. Kam se kam ek up ho to tunnel interface use ke layak hota hai.</p>

<h3>Hub side ek template hai</h3>
<p>Dial-up hub par phase 2 <code>KR-P2</code> defaults rakhta hai, dono taraf 0.0.0.0/0, PFS enabled. Responder koi bhi proposed traffic selector accept kar leta hai, isliye har spoke apni LAN kuch bhi ho, wahi phase 2 use kar sakta hai. Spoke PFS disable kare to hub reject kar deta hai, bilkul ticket KR-2310 (teesra fault) ki tarah. Spoke par fix: <code>config vpn ipsec phase2-interface</code>, <code>edit "TO-HQ-P2"</code>, <code>set pfs enable</code>.</p>
<div class="warn"><p><b>Common mistake.</b> "Chalane ke liye" PFS off kar dena. Yeh asli mismatch chhupata hai aur security kamzor karta hai. Dono sides align karo aur PFS on rakho, jab tak peer ki documented limitation majboor na kare.</p></div>
<div class="exam"><p><b>Exam trap.</b> PFS mismatch aur proposal mismatch ka IKE debug ek jaisa dikhta hai. Log line mein phase 2 ka naam dekho, aur dono sides par <code>show full-configuration vpn ipsec phase2-interface</code> mein <code>pfs</code>, <code>dhgrp</code> aur <code>proposal</code> check karo.</p></div>

<div class="scn"><h4>Acquisition ke baad</h4><p>Kaveri ne ek chhoti chain kharidi aur uski Salem shop ko ek third-party router se jodha jo proxy ID 10.40.0.0/24 se 10.10.0.0/24 par adda tha. FortiGate par 0.0.0.0/0 tha. Phase 1 up hua, phase 2 TS_UNACCEPTABLE se fail hua. Fix router badalna nahi, balki exactly do subnets wala doosra phase 2 banana tha.</p><p><b>Lesson:</b> wide selectors FortiGate-to-FortiGate ke liye hain; doosre vendors ke liye unke proxy IDs mirror karo.</p></div>

<div class="iv"><p class="q">"FortiGate tunnels aam taur par 0.0.0.0/0 selectors kyun use karte hain?"</p><p>Kyunki routing aur firewall policy pehle hi tay karte hain ki tunnel mein kya jaye; wide selectors VPN ko uske peeche ke networks se independent rakhte hain, to BGP ya static routes azaadi se badal sakte hain. Batao ki narrow selectors sirf policy-based peers ke saath interoperability ke liye lagate ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Phase 2 = child SA: proposal, PFS, selectors.</li>
<li>PFS default on hai aur dono ends ko agree karna padta hai.</li>
<li>Route-based FortiGate tunnels mein 0.0.0.0/0 selectors normal hain.</li>
<li>selectors(total,up) 1/0 ka matlab phase 1 theek, phase 2 nahi.</li>
<li>TS_UNACCEPTABLE = selectors; phase 2 mein NO_PROPOSAL_CHOSEN = proposal ya PFS/DH.</li>
</ul></div>
`}};export{e as default};