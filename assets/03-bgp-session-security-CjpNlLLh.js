var e={id:`bgp-session-security`,h:{en:`BGP session security: TTL security (GTSM), authentication and route hygiene`,hi:`BGP session security: TTL security (GTSM), authentication aur route hygiene`},body:{en:`
<p><b>The problem.</b> BGP runs over TCP port 179. Anyone who can send packets to the router and guess the addresses and ports could, in theory, inject a forged TCP segment (for example a reset) and tear the session down. When a session drops, routes are withdrawn and customers notice. We want the router to accept BGP packets only from the real neighbor. Three layers do that: TTL security, authentication, and filtering of what the neighbor may tell us.</p>
<h3>TTL security: the Generalized TTL Security Mechanism (GTSM)</h3>
<p>GTSM (RFC 5082) uses a simple fact: a packet from a directly connected neighbor has not crossed any router, so if the sender sets IP TTL to 255, it arrives with TTL 255. A packet from far away must cross at least one router, which decrements the TTL, so it can never arrive with 255. With GTSM, both neighbors send BGP packets with TTL 255, and each side accepts only packets whose TTL is at least <code>255 minus hops</code>. For a directly connected eBGP peer, hops is 1, meaning the receiver accepts TTL 254 or more. Forged packets from the Internet arrive with a lower TTL and are discarded before the BGP process even looks at them.</p>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="diagram"><rect x="20" y="25" width="127" height="60" rx="10" fill="#bae6fd"/><text x="83.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Real peer</text><text x="83.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">sends TTL 255</text><line x1="147" y1="55" x2="177" y2="55" stroke="#64748b" stroke-width="2"/><rect x="177" y="25" width="127" height="60" rx="10" fill="#bbf7d0"/><text x="240.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Link</text><text x="240.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">TTL stays 255</text><line x1="304" y1="55" x2="334" y2="55" stroke="#64748b" stroke-width="2"/><rect x="334" y="25" width="127" height="60" rx="10" fill="#ddd6fe"/><text x="397.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Router</text><text x="397.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">accepts 254 or more</text><line x1="461" y1="55" x2="491" y2="55" stroke="#64748b" stroke-width="2"/><rect x="491" y="25" width="127" height="60" rx="10" fill="#fde68a"/><text x="554.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Remote forger</text><text x="554.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">arrives lower</text></svg><p class="cap">GTSM: only packets that could not have crossed a router are accepted.</p></div>
<p><b>Reference configuration (not run in the simulator).</b> You can practise TTL security in the enarsi-bgp module.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator) - IOS XE, on BOTH routers</span>
router bgp 65010
 neighbor 192.0.2.2 remote-as 65020
 neighbor 192.0.2.2 ttl-security hops 1

<span class="c">! IOS XR equivalent</span>
router bgp 65010
 neighbor 192.0.2.2
  remote-as 65020
  ttl-security</pre>
<div class="warn"><p><b>Common mistake.</b> Enabling GTSM on only one side. The other side still sends eBGP with TTL 1, the protected router drops it, and the session dies with hold timer expiry. Also, <code>ebgp-multihop</code> and <code>ttl-security</code> cannot be combined on the same neighbor in the usual eBGP design, and setting hops to a big value removes the protection.</p></div>
<h3>Authentication: MD5 and TCP-AO</h3>
<p>The classic TCP MD5 signature option (RFC 2385) adds a keyed hash to every segment. A forged segment without the right key is silently dropped. Both sides need the same password. The modern replacement is the <b>TCP Authentication Option (TCP-AO, RFC 5925)</b>, which supports stronger algorithms and key rollover through key chains; platform support and syntax differ, so check your release. In every example below the key is an obvious placeholder.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
router bgp 65010
 neighbor 192.0.2.2 password PLACEHOLDER-KEY-1

<span class="c">! Verify the session came up; a key mismatch shows as a session that never establishes</span>
show ip bgp summary</pre>
<p>A key mismatch is hard to see: the router that has a password silently drops segments without a valid signature, and the console may log an authentication failure for that peer. The symptom is a session stuck in Active or Connect.</p>
<h3>Route hygiene: what the neighbor may tell you</h3>
<ul><li><b>Inbound prefix filters.</b> Customers: accept only their registered prefixes. Peers and upstreams: reject bogons (private, documentation, loopback ranges), your own prefixes, and very long prefixes.</li>
<li><b>maximum-prefix.</b> Caps how many prefixes a neighbor may send. A leak crosses the limit and the router warns or shuts the session. Set a warning threshold first.</li>
<li><b>Origin validation (RPKI, RFC 6811).</b> The router asks a validator whether the origin AS is authorised for the prefix and marks it valid, invalid or not-found. Policy can then prefer valid routes and drop invalid ones.</li>
<li><b>Outbound filters.</b> Send only your own and your customers' prefixes so you never become an accidental transit path.</li></ul>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
router bgp 65010
 neighbor 203.0.113.2 maximum-prefix 100 80 restart 10</pre>
<div class="exam"><p><b>Exam trap.</b> GTSM protects against off-link forged packets only. A compromised directly connected neighbor, or a router on the same segment, can still send TTL 255. That is why GTSM is combined with authentication and filters, not used alone. Also know the formula: accepted TTL is 255 minus hops, with hops 1 for a direct peer.</p></div>
<div class="scn"><h4>Hold timer expired after a hardening change</h4><p>An engineer enabled ttl-security hops 1 on a border router toward a peer during a security review, but the peer team had not yet changed their side. The peer kept sending TTL 1 packets, the border router discarded them, and the session dropped after the hold time. Rolling out the same change on both ends in a window, with commit confirmed or a rollback plan, restored the session with TTL 254 or more on both sides.</p><p><b>Lesson:</b> GTSM is symmetric: coordinate both ends.</p></div>
<div class="iv"><p class="q">"How does GTSM protect a BGP session?"</p><p>Both peers send BGP packets with TTL 255 and accept only TTL 255 minus hops or higher. A forged packet from a remote source must cross at least one router, so its TTL is lower and it is dropped before reaching the BGP process. It must be configured on both ends, and it complements MD5 or TCP-AO and prefix filters.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>GTSM: send TTL 255, accept 255 minus hops or more; both sides must enable it.</li>
<li>MD5 (RFC 2385) and TCP-AO (RFC 5925) authenticate the TCP segments.</li>
<li>maximum-prefix and prefix filters limit damage from leaks.</li>
<li>RPKI origin validation marks routes valid, invalid or not-found.</li>
<li>Layer the controls; none is enough alone.</li></ul></div>
`,hi:`
<p><b>Problem.</b> BGP TCP port 179 par chalta hai. Jo bhi router ko packets bhej sakta hai aur addresses aur ports guess kar sake, woh theory mein forged TCP segment (jaise reset) inject karke session gira sakta hai. Session girta hai to routes withdraw ho jaate hain aur customers ko pata chalta hai. Hum chahte hain ki router BGP packets sirf asli neighbor se accept kare. Yeh teen layers karti hain: TTL security, authentication, aur neighbor jo bata sakta hai uska filtering.</p>
<h3>TTL security: Generalized TTL Security Mechanism (GTSM)</h3>
<p>GTSM (RFC 5082) ek simple fact use karta hai: directly connected neighbor ka packet kisi router se nahi guzra, isliye sender IP TTL 255 set kare to woh 255 par hi pahunchta hai. Door se aaya packet kam se kam ek router cross karta hai, jo TTL ghataata hai, isliye woh kabhi 255 par nahi pahunch sakta. GTSM mein dono neighbors BGP packets TTL 255 ke saath bhejte hain, aur har side sirf unhi packets ko accept karti hai jinka TTL kam se kam <code>255 minus hops</code> ho. Directly connected eBGP peer ke liye hops 1 hai, yaani receiver TTL 254 ya zyada accept karta hai. Internet se aaye forged packets kam TTL ke saath pahunchte hain aur BGP process ke dekhne se pehle hi discard ho jaate hain.</p>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="diagram"><rect x="20" y="25" width="127" height="60" rx="10" fill="#bae6fd"/><text x="83.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Real peer</text><text x="83.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">sends TTL 255</text><line x1="147" y1="55" x2="177" y2="55" stroke="#64748b" stroke-width="2"/><rect x="177" y="25" width="127" height="60" rx="10" fill="#bbf7d0"/><text x="240.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Link</text><text x="240.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">TTL stays 255</text><line x1="304" y1="55" x2="334" y2="55" stroke="#64748b" stroke-width="2"/><rect x="334" y="25" width="127" height="60" rx="10" fill="#ddd6fe"/><text x="397.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Router</text><text x="397.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">accepts 254 or more</text><line x1="461" y1="55" x2="491" y2="55" stroke="#64748b" stroke-width="2"/><rect x="491" y="25" width="127" height="60" rx="10" fill="#fde68a"/><text x="554.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Remote forger</text><text x="554.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">kam TTL pahunchta hai</text></svg><p class="cap">GTSM: sirf wahi packets accept hote hain jo kisi router se nahi guzre ho sakte.</p></div>
<p><b>Reference configuration (not run in the simulator).</b> TTL security aap enarsi-bgp module mein practise kar sakte ho.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator) - IOS XE, on BOTH routers</span>
router bgp 65010
 neighbor 192.0.2.2 remote-as 65020
 neighbor 192.0.2.2 ttl-security hops 1

<span class="c">! IOS XR equivalent</span>
router bgp 65010
 neighbor 192.0.2.2
  remote-as 65020
  ttl-security</pre>
<div class="warn"><p><b>Common mistake.</b> GTSM sirf ek side par enable karna. Doosri side abhi bhi eBGP TTL 1 ke saath bhejti hai, protected router use drop karta hai, aur session hold timer expiry se mar jaata hai. Saath hi, aam eBGP design mein <code>ebgp-multihop</code> aur <code>ttl-security</code> ek hi neighbor par combine nahi hote, aur hops bada rakhne se protection khatam ho jaati hai.</p></div>
<h3>Authentication: MD5 aur TCP-AO</h3>
<p>Classic TCP MD5 signature option (RFC 2385) har segment mein keyed hash jodta hai. Sahi key ke bina forged segment chupchap drop ho jaata hai. Dono sides ko same password chahiye. Modern replacement <b>TCP Authentication Option (TCP-AO, RFC 5925)</b> hai, jo stronger algorithms aur key chains se key rollover support karta hai; platform support aur syntax alag hain, isliye apni release check karo. Neeche har example mein key obvious placeholder hai.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
router bgp 65010
 neighbor 192.0.2.2 password PLACEHOLDER-KEY-1

<span class="c">! Verify the session came up; a key mismatch shows as a session that never establishes</span>
show ip bgp summary</pre>
<p>Key mismatch dekhna mushkil hai: jis router par password hai woh bina valid signature wale segments chupchap drop karta hai, aur console us peer ke liye authentication failure log kar sakta hai. Symptom hai session ka Active ya Connect mein atke rehna.</p>
<h3>Route hygiene: neighbor aapko kya bata sakta hai</h3>
<ul><li><b>Inbound prefix filters.</b> Customers: sirf unke registered prefixes accept karo. Peers aur upstreams: bogons (private, documentation, loopback ranges), apne prefixes aur bahut lambe prefixes reject karo.</li>
<li><b>maximum-prefix.</b> Neighbor kitne prefixes bhej sakta hai uski seema. Leak limit paar karta hai aur router warn karta hai ya session shut kar deta hai. Pehle warning threshold set karo.</li>
<li><b>Origin validation (RPKI, RFC 6811).</b> Router validator se poochta hai ki prefix ke liye origin AS authorised hai ya nahi aur use valid, invalid ya not-found mark karta hai. Policy phir valid routes prefer karti hai aur invalid drop karti hai.</li>
<li><b>Outbound filters.</b> Sirf apne aur apne customers ke prefixes bhejo taaki aap accidentally transit path na ban jaao.</li></ul>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
router bgp 65010
 neighbor 203.0.113.2 maximum-prefix 100 80 restart 10</pre>
<div class="exam"><p><b>Exam trap.</b> GTSM sirf off-link forged packets se bachata hai. Compromised directly connected neighbor ya usi segment ka router abhi bhi TTL 255 bhej sakta hai. Isliye GTSM ko authentication aur filters ke saath use karte hain, akela nahi. Formula yaad rakho: accepted TTL 255 minus hops hai, direct peer ke liye hops 1.</p></div>
<div class="scn"><h4>Hardening change ke baad hold timer expire</h4><p>Engineer ne security review ke dauran border router par peer ki taraf ttl-security hops 1 enable kiya, par peer team ne apni side abhi change nahi ki thi. Peer TTL 1 packets bhejta raha, border router ne unhe discard kiya, aur hold time ke baad session gir gaya. Dono ends par maintenance window mein same change, commit confirmed ya rollback plan ke saath, session wapas laya jisme dono sides par TTL 254 ya zyada tha.</p><p><b>Lesson:</b> GTSM symmetric hai: dono ends coordinate karo.</p></div>
<div class="iv"><p class="q">"GTSM BGP session ko kaise protect karta hai?"</p><p>Dono peers BGP packets TTL 255 ke saath bhejte hain aur sirf TTL 255 minus hops ya zyada accept karte hain. Remote source se aaya forged packet kam se kam ek router cross karta hai, isliye uska TTL kam hota hai aur BGP process tak pahunchne se pehle drop ho jaata hai. Yeh dono ends par configure hona chahiye, aur yeh MD5 ya TCP-AO aur prefix filters ka complement hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>GTSM: TTL 255 bhejo, 255 minus hops ya zyada accept karo; dono sides enable karni hongi.</li>
<li>MD5 (RFC 2385) aur TCP-AO (RFC 5925) TCP segments authenticate karte hain.</li>
<li>maximum-prefix aur prefix filters leaks ka nuksaan seemit karte hain.</li>
<li>RPKI origin validation routes ko valid, invalid ya not-found mark karta hai.</li>
<li>Controls ko layer karo; koi akela kaafi nahi.</li></ul></div>
`}};export{e as default};