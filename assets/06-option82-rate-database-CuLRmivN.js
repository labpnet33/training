var e={id:`opt82`,h:{en:`Option 82, rate limiting and the binding database`,hi:`Option 82, rate limiting aur binding database`},body:{en:`
<p>When you post a parcel through a courier's local branch, the branch staples a small label on it: "received at branch 14, counter 3". Head office can see where every parcel entered the network. But if head office has a strict rule, "any parcel with a branch label must also show the branch's return address", then a label without a return address looks forged and the parcel is rejected. That is exactly the famous <b>option 82</b> problem with DHCP snooping.</p>

<h3>What option 82 is</h3>
<p><b>DHCP option 82</b>, the <b>relay agent information option</b>, is extra data a network device adds to a client's DHCP request. It has two sub-options: the <b>circuit ID</b> (which VLAN and port the request came in on) and the <b>remote ID</b> (which switch, usually its MAC). Service providers and large campuses use it so the DHCP server can choose an address or policy by physical location.</p>
<p>On Cisco Catalyst switches, enabling DHCP snooping also enables <b>option 82 insertion by default</b>. The switch inserts option 82 into Discovers and Requests from untrusted ports. But the access switch is a Layer 2 device, not a relay agent, so it leaves the <b>giaddr</b> (gateway IP address) field at <b>0.0.0.0</b>.</p>

<h3>The classic problem</h3>
<p>A Cisco IOS router acting as DHCP server or DHCP relay (<code>ip helper-address</code>) checks incoming requests. A packet that contains option 82 but has giaddr 0.0.0.0 looks inconsistent: "someone added relay information but no relay address". By default IOS <b>drops</b> it. The client never gets an Offer, and it looks as if DHCP snooping "broke DHCP" even though every port is configured correctly.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Option 82 with giaddr zero">
<rect x="10" y="70" width="110" height="50" rx="8" fill="#e2e8f0"/><text x="65" y="100" text-anchor="middle" class="svg-ink" font-size="13">PC1</text>
<line x1="120" y1="95" x2="200" y2="95" stroke="#64748b" stroke-width="2"/><text x="160" y="85" text-anchor="middle" class="svg-muted" font-size="12">Discover</text>
<rect x="200" y="60" width="170" height="70" rx="8" fill="#bae6fd"/><text x="285" y="88" text-anchor="middle" class="svg-ink" font-size="13">SW1 snooping</text><text x="285" y="110" text-anchor="middle" class="svg-accent" font-size="12">adds option 82</text>
<line x1="370" y1="95" x2="460" y2="95" stroke="#64748b" stroke-width="2"/><text x="415" y="85" text-anchor="middle" class="svg-muted" font-size="12">giaddr 0.0.0.0</text>
<rect x="460" y="60" width="170" height="70" rx="8" fill="#fed7aa"/><text x="545" y="88" text-anchor="middle" class="svg-ink" font-size="13">R1 IOS server</text><text x="545" y="110" text-anchor="middle" class="svg-accent" font-size="12">drops request</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Fix: no option 82 on SW1, or trust relay information on R1</text>
</svg><p class="cap">Option 82 plus giaddr 0.0.0.0 looks forged to an IOS DHCP server or relay.</p></div>

<p>You can see it on the router with a debug:</p>
<pre class="out">R1# debug ip dhcp server packet
<span class="hl">DHCPD: inconsistent relay information.
DHCPD: relay information option exists, but giaddr is zero.</span></pre>

<h3>Ways to fix it</h3>
<table class="cmp"><tr><th>Where</th><th>Command</th><th>When to use</th></tr>
<tr><td>Access switch (global)</td><td><code>no ip dhcp snooping information option</code></td><td>You do not need option 82 at all (most enterprises, and the lab)</td></tr>
<tr><td>IOS server or relay (interface)</td><td><code>ip dhcp relay information trusted</code></td><td>You want option 82 kept, on that client-facing interface</td></tr>
<tr><td>IOS server or relay (global)</td><td><code>ip dhcp relay information trust-all</code></td><td>Same, for every interface</td></tr>
<tr><td>Aggregation snooping switch (global)</td><td><code>ip dhcp snooping information option allow-untrusted</code></td><td>A second snooping switch receives option 82 from an edge switch on an untrusted port</td></tr>
</table>
<p>The last row is the same problem one layer up: by default a snooping switch also drops requests that arrive on an untrusted port already carrying option 82 (you see "Option 82 on untrusted port is not allowed" in <code>show ip dhcp snooping</code>).</p>

<div class="eg"><p><b>Worked example.</b> In the lab, R1 (10.10.10.1) is an IOS DHCP server in VLAN 10, not behind a relay. With snooping on and default insertion, PC1's Discover reaches R1 with option 82 and giaddr 0.0.0.0, and R1 ignores it. Entering <code>no ip dhcp snooping information option</code> on SW1 removes the option, and PC1 immediately leases 10.10.10.100. <code>show ip dhcp snooping</code> now shows "Insertion of option 82 is disabled".</p></div>

<h3>Rate limiting in detail</h3>
<p><code>ip dhcp snooping limit rate N</code> sets how many DHCP packets per second an interface may receive. If the rate is exceeded, the port goes <b>err-disabled</b> with the reason <code>dhcp-rate-limit</code>:</p>
<pre class="out">%DHCP_SNOOPING-4-DHCP_SNOOPING_ERRDISABLE_WARNING: DHCP Snooping received 11 DHCP packets on interface Gi0/5
<span class="hl">%PM-4-ERR_DISABLE: dhcp-rate-limit error detected on Gi0/5, putting Gi0/5 in err-disable state</span></pre>
<ul>
<li>Apply it to <b>untrusted</b> access ports. A normal client sends only a few DHCP packets a minute, so 10 to 15 pps is generous.</li>
<li>Be careful on <b>trusted</b> uplinks: they carry DHCP for hundreds of clients. Leave them unlimited or set a high value, or a busy Monday morning err-disables your uplink.</li>
<li>Recover with <code>errdisable recovery cause dhcp-rate-limit</code> if you want automatic recovery.</li>
</ul>

<h3>Keeping bindings across a reload</h3>
<p>The binding table lives in RAM. After a reload it is empty, and features that depend on it (DAI, IP Source Guard) will drop traffic from hosts whose leases are still valid until they renew. Save the table to storage with the <b>DHCP snooping database agent</b>:</p>
<pre class="code">SW1(config)# ip dhcp snooping database flash:snoop-db.txt
SW1(config)# ip dhcp snooping database write-delay 300   <span class="c">! seconds after a change</span>
SW1# show ip dhcp snooping database</pre>

<div class="warn"><p><b>Common mistakes.</b> (1) Blaming the rogue-server fix when clients stop getting addresses right after enabling snooping; check option 82 and the uplink trust first. (2) Rate-limiting the trusted uplink with the same small value as access ports. (3) Enabling DAI in production without the binding database, then losing every host after a switch reload.</p></div>

<div class="exam"><p><b>Exam trap.</b> Option 82 insertion is <b>on by default</b> when snooping is enabled on Catalyst IOS. The access switch sets option 82 but <b>not giaddr</b>. The IOS server drops it because giaddr is zero. Exceeding the snooping rate limit err-disables the port (it does not just drop the extra packets).</p></div>

<div class="scn"><h4>Snooping rollout that "broke DHCP"</h4><p>A company rolled out DHCP snooping on 30 access switches overnight. By morning, laptops that had rebooted had 169.254.x.x addresses, while PCs with old leases worked. Uplinks were trusted, so the engineer ran <code>debug ip dhcp server packet</code> on the core router acting as DHCP server and saw "relay information option exists, but giaddr is zero". The core router also served VLANs through relays elsewhere, so instead of changing 30 switches the team added <code>ip dhcp relay information trusted</code> on the core SVIs facing the access VLANs. Leases came back within minutes.</p><p><b>Lesson:</b> when DHCP fails right after enabling snooping and trust is correct, think option 82 first.</p></div>

<div class="iv"><p class="q">"You enabled DHCP snooping and now clients get no address, but the uplink is trusted. What happened?"</p><p>Strong answer: the classic option 82 issue. The snooping switch inserts option 82 by default but leaves giaddr as 0.0.0.0, and an IOS DHCP server or relay drops such packets as inconsistent. Prove it with <code>debug ip dhcp server packet</code>, then fix it either with <code>no ip dhcp snooping information option</code> on the switch or <code>ip dhcp relay information trusted</code> (or trust-all) on the router. Mention allow-untrusted for a second snooping switch.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Option 82 carries circuit ID and remote ID; Catalyst snooping inserts it by default.</li>
<li>The switch leaves giaddr at 0.0.0.0, so IOS servers and relays drop the request as inconsistent.</li>
<li>Fix with no ip dhcp snooping information option, or ip dhcp relay information trusted / trust-all on the router.</li>
<li>The snooping rate limit err-disables a port (dhcp-rate-limit); do not choke the trusted uplink.</li>
<li>Save bindings with ip dhcp snooping database so DAI survives a reload.</li>
</ul></div>
`,hi:`
<p>Jab aap courier ki local branch se parcel bhejte ho, branch us par ek chhota label staple kar deti hai: "branch 14, counter 3 par mila". Head office dekh sakta hai ki har parcel network mein kahan se aaya. Lekin agar head office ka strict rule hai ki "jis parcel par branch label hai us par branch ka return address bhi hona chahiye", to bina return address wala label forged lagta hai aur parcel reject ho jaata hai. DHCP snooping ke saath mashhoor <b>option 82</b> problem bilkul yahi hai.</p>

<h3>Option 82 kya hai</h3>
<p><b>DHCP option 82</b>, yaani <b>relay agent information option</b>, woh extra data hai jo koi network device client ki DHCP request mein jodta hai. Iske do sub-options hain: <b>circuit ID</b> (request kis VLAN aur port par aayi) aur <b>remote ID</b> (kaunsa switch, aam taur par uska MAC). Service providers aur bade campuses ise use karte hain taaki DHCP server physical location ke hisaab se address ya policy chun sake.</p>
<p>Cisco Catalyst switches par DHCP snooping enable karne se <b>option 82 insertion default mein on</b> ho jaata hai. Switch untrusted ports se aane wale Discovers aur Requests mein option 82 daalta hai. Lekin access switch Layer 2 device hai, relay agent nahi, isliye woh <b>giaddr</b> (gateway IP address) field ko <b>0.0.0.0</b> par chhod deta hai.</p>

<h3>Classic problem</h3>
<p>DHCP server ya DHCP relay (<code>ip helper-address</code>) ki tarah kaam karne wala Cisco IOS router aane wali requests check karta hai. Jis packet mein option 82 hai lekin giaddr 0.0.0.0 hai woh inconsistent lagta hai: "kisi ne relay information jodi lekin relay address nahi". Default mein IOS use <b>drop</b> kar deta hai. Client ko kabhi Offer nahi milta, aur aisa lagta hai ki DHCP snooping ne "DHCP tod diya" jabki har port sahi configured hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Option 82 giaddr zero ke saath">
<rect x="10" y="70" width="110" height="50" rx="8" fill="#e2e8f0"/><text x="65" y="100" text-anchor="middle" class="svg-ink" font-size="13">PC1</text>
<line x1="120" y1="95" x2="200" y2="95" stroke="#64748b" stroke-width="2"/><text x="160" y="85" text-anchor="middle" class="svg-muted" font-size="12">Discover</text>
<rect x="200" y="60" width="170" height="70" rx="8" fill="#bae6fd"/><text x="285" y="88" text-anchor="middle" class="svg-ink" font-size="13">SW1 snooping</text><text x="285" y="110" text-anchor="middle" class="svg-accent" font-size="12">option 82 jodta hai</text>
<line x1="370" y1="95" x2="460" y2="95" stroke="#64748b" stroke-width="2"/><text x="415" y="85" text-anchor="middle" class="svg-muted" font-size="12">giaddr 0.0.0.0</text>
<rect x="460" y="60" width="170" height="70" rx="8" fill="#fed7aa"/><text x="545" y="88" text-anchor="middle" class="svg-ink" font-size="13">R1 IOS server</text><text x="545" y="110" text-anchor="middle" class="svg-accent" font-size="12">request drop</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Fix: SW1 par option 82 band, ya R1 par relay information trust</text>
</svg><p class="cap">Option 82 plus giaddr 0.0.0.0 IOS DHCP server ya relay ko forged lagta hai.</p></div>

<p>Router par debug se yeh dikh jaata hai:</p>
<pre class="out">R1# debug ip dhcp server packet
<span class="hl">DHCPD: inconsistent relay information.
DHCPD: relay information option exists, but giaddr is zero.</span></pre>

<h3>Fix karne ke tareeke</h3>
<table class="cmp"><tr><th>Kahan</th><th>Command</th><th>Kab use karein</th></tr>
<tr><td>Access switch (global)</td><td><code>no ip dhcp snooping information option</code></td><td>Aapko option 82 bilkul nahi chahiye (zyada tar enterprises, aur lab)</td></tr>
<tr><td>IOS server ya relay (interface)</td><td><code>ip dhcp relay information trusted</code></td><td>Aap option 82 rakhna chahte ho, us client-facing interface par</td></tr>
<tr><td>IOS server ya relay (global)</td><td><code>ip dhcp relay information trust-all</code></td><td>Wahi, har interface ke liye</td></tr>
<tr><td>Aggregation snooping switch (global)</td><td><code>ip dhcp snooping information option allow-untrusted</code></td><td>Doosre snooping switch ko edge switch se untrusted port par option 82 milta hai</td></tr>
</table>
<p>Aakhri row wahi problem ek layer upar hai: default mein snooping switch un requests ko bhi drop karta hai jo untrusted port par pehle se option 82 le kar aati hain (<code>show ip dhcp snooping</code> mein "Option 82 on untrusted port is not allowed" dikhta hai).</p>

<div class="eg"><p><b>Worked example.</b> Lab mein R1 (10.10.10.1) VLAN 10 mein IOS DHCP server hai, relay ke peeche nahi. Snooping on aur default insertion ke saath, PC1 ka Discover option 82 aur giaddr 0.0.0.0 ke saath R1 tak pahunchta hai, aur R1 use ignore kar deta hai. SW1 par <code>no ip dhcp snooping information option</code> daalne se option hat jaata hai, aur PC1 turant 10.10.10.100 lease kar leta hai. <code>show ip dhcp snooping</code> ab "Insertion of option 82 is disabled" dikhata hai.</p></div>

<h3>Rate limiting detail mein</h3>
<p><code>ip dhcp snooping limit rate N</code> set karta hai ki ek interface har second kitne DHCP packets le sakta hai. Rate exceed hone par port reason <code>dhcp-rate-limit</code> ke saath <b>err-disabled</b> ho jaata hai:</p>
<pre class="out">%DHCP_SNOOPING-4-DHCP_SNOOPING_ERRDISABLE_WARNING: DHCP Snooping received 11 DHCP packets on interface Gi0/5
<span class="hl">%PM-4-ERR_DISABLE: dhcp-rate-limit error detected on Gi0/5, putting Gi0/5 in err-disable state</span></pre>
<ul>
<li>Ise <b>untrusted</b> access ports par lagao. Normal client ek minute mein sirf kuch DHCP packets bhejta hai, isliye 10 se 15 pps kaafi hai.</li>
<li><b>Trusted</b> uplinks par dhyaan do: woh sainkdon clients ka DHCP le jaate hain. Unhe unlimited chhodo ya high value set karo, warna busy Monday subah aapka uplink err-disable ho jaayega.</li>
<li>Automatic recovery chahiye to <code>errdisable recovery cause dhcp-rate-limit</code> se recover karo.</li>
</ul>

<h3>Reload ke baad bhi bindings rakhna</h3>
<p>Binding table RAM mein rehti hai. Reload ke baad woh khaali hoti hai, aur jo features us par depend karte hain (DAI, IP Source Guard) un hosts ka traffic drop karenge jinki leases abhi valid hain, jab tak woh renew na karein. <b>DHCP snooping database agent</b> se table ko storage mein save karo:</p>
<pre class="code">SW1(config)# ip dhcp snooping database flash:snoop-db.txt
SW1(config)# ip dhcp snooping database write-delay 300   <span class="c">! change ke baad seconds</span>
SW1# show ip dhcp snooping database</pre>

<div class="warn"><p><b>Common galtiyan.</b> (1) Snooping enable karte hi clients ko address milna band ho to rogue-server fix ko dosh dena; pehle option 82 aur uplink trust check karo. (2) Trusted uplink ko access ports jaisi chhoti value se rate-limit karna. (3) Production mein binding database ke bina DAI enable karna, phir switch reload ke baad har host kho dena.</p></div>

<div class="exam"><p><b>Exam trap.</b> Catalyst IOS par snooping enable hone par option 82 insertion <b>default mein on</b> hota hai. Access switch option 82 set karta hai lekin <b>giaddr nahi</b>. IOS server use drop karta hai kyunki giaddr zero hai. Snooping rate limit exceed hone par port err-disable hota hai (sirf extra packets drop nahi hote).</p></div>

<div class="scn"><h4>Snooping rollout jisne "DHCP tod diya"</h4><p>Ek company ne raat bhar mein 30 access switches par DHCP snooping roll out kiya. Subah tak jo laptops reboot hue unke paas 169.254.x.x addresses the, jabki purani leases wale PCs chal rahe the. Uplinks trusted the, isliye engineer ne DHCP server ka kaam karne wale core router par <code>debug ip dhcp server packet</code> chalaya aur "relay information option exists, but giaddr is zero" dekha. Core router doosri jagah relays ke through bhi VLANs serve karta tha, isliye 30 switches badalne ki jagah team ne access VLANs ki taraf ke core SVIs par <code>ip dhcp relay information trusted</code> joda. Minutes mein leases wapas aa gayi.</p><p><b>Seekh:</b> jab snooping enable karte hi DHCP fail ho aur trust sahi ho, to sabse pehle option 82 socho.</p></div>

<div class="iv"><p class="q">"Aapne DHCP snooping enable kiya aur ab clients ko address nahi mil raha, lekin uplink trusted hai. Kya hua?"</p><p>Strong answer: classic option 82 issue. Snooping switch default mein option 82 daalta hai lekin giaddr ko 0.0.0.0 chhod deta hai, aur IOS DHCP server ya relay aise packets ko inconsistent maan kar drop karta hai. <code>debug ip dhcp server packet</code> se prove karo, phir ya to switch par <code>no ip dhcp snooping information option</code> se ya router par <code>ip dhcp relay information trusted</code> (ya trust-all) se fix karo. Doosre snooping switch ke liye allow-untrusted bhi batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Option 82 circuit ID aur remote ID le jaata hai; Catalyst snooping ise default mein daalta hai.</li>
<li>Switch giaddr ko 0.0.0.0 chhodta hai, isliye IOS servers aur relays request ko inconsistent maan kar drop karte hain.</li>
<li>no ip dhcp snooping information option se, ya router par ip dhcp relay information trusted / trust-all se fix karo.</li>
<li>Snooping rate limit port ko err-disable karta hai (dhcp-rate-limit); trusted uplink ka gala mat ghoto.</li>
<li>ip dhcp snooping database se bindings save karo taaki DAI reload survive kare.</li>
</ul></div>
`}};export{e as default};