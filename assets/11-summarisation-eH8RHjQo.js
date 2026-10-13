var e={id:`summarisation`,h:{en:`Summarisation with aggregate-address`,hi:`aggregate-address se summarisation`},body:{en:`
<p>A company with four floors does not print four separate addresses on its letterhead. It prints one building address, and the reception desk sorts post to the right floor. Route summarisation does the same: instead of announcing four /24 networks to the world, you announce one /22 and route internally to the right subnet. Fewer routes mean smaller tables for everyone, and internal flaps stay hidden.</p>

<h3>Two ways to originate a summary</h3>
<ol>
<li><b>Static route to Null0 plus a network statement.</b> <code>ip route 192.168.48.0 255.255.252.0 Null0</code> and <code>network 192.168.48.0 mask 255.255.252.0</code>. The static route makes the exact prefix exist in the RIB, so the network statement matches. The summary is advertised as long as the router is up, even if every LAN is down.</li>
<li><b><code>aggregate-address</code></b>, BGP's own method. It creates the summary only if <b>at least one more-specific prefix exists in the BGP table</b> (not merely in the RIB).</li>
</ol>

<h3>aggregate-address and its options</h3>
<p>Kaveri Textiles has grown to four LANs, 192.168.48.0/24 to 192.168.51.0/24, each advertised with its own <code>network</code> statement on CUST-EDGE.</p>
<pre class="code">router bgp 65010
 network 192.168.48.0 mask 255.255.255.0
 network 192.168.49.0 mask 255.255.255.0
 network 192.168.50.0 mask 255.255.255.0
 network 192.168.51.0 mask 255.255.255.0
 aggregate-address 192.168.48.0 255.255.252.0 summary-only
<span class="c">! advertise the /22 and suppress the four /24s</span></pre>
<ul>
<li><b>Without options</b>: the aggregate <b>and</b> all the more-specific routes are advertised. Rarely what you want.</li>
<li><b><code>summary-only</code></b>: only the aggregate is advertised; the more-specifics are marked <code>s</code> (suppressed) and stay local.</li>
<li><b><code>as-set</code></b>: the aggregate carries an <b>AS_SET</b> listing every AS from the component paths, which keeps loop prevention working. Without it, the aggregate gets the <b>ATOMIC_AGGREGATE</b> flag to warn that path detail was lost.</li>
<li><b><code>suppress-map</code></b>: suppress only selected more-specifics and leak the rest.</li>
</ul>
<p>Every aggregate also carries the <b>AGGREGATOR</b> attribute (the ASN and router ID that built it). The router installs a matching <b>Null0 route with AD 200</b> to discard traffic for parts of the summary that do not exist, preventing loops.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Four /24 prefixes summarised to one /22">
<rect x="10" y="20" width="160" height="34" rx="6" fill="#e2e8f0"/><text x="90" y="42" text-anchor="middle" class="svg-ink" font-size="12">192.168.48.0/24  s</text>
<rect x="10" y="62" width="160" height="34" rx="6" fill="#e2e8f0"/><text x="90" y="84" text-anchor="middle" class="svg-ink" font-size="12">192.168.49.0/24  s</text>
<rect x="10" y="104" width="160" height="34" rx="6" fill="#e2e8f0"/><text x="90" y="126" text-anchor="middle" class="svg-ink" font-size="12">192.168.50.0/24  s</text>
<rect x="10" y="146" width="160" height="34" rx="6" fill="#e2e8f0"/><text x="90" y="168" text-anchor="middle" class="svg-ink" font-size="12">192.168.51.0/24  s</text>
<line x1="170" y1="37" x2="250" y2="100" stroke="#64748b"/><line x1="170" y1="79" x2="250" y2="100" stroke="#64748b"/><line x1="170" y1="121" x2="250" y2="100" stroke="#64748b"/><line x1="170" y1="163" x2="250" y2="100" stroke="#64748b"/>
<rect x="250" y="75" width="170" height="50" rx="8" fill="#bae6fd"/><text x="335" y="97" text-anchor="middle" class="svg-ink" font-size="13">192.168.48.0/22</text><text x="335" y="115" text-anchor="middle" class="svg-muted" font-size="12">CUST-EDGE aggregate</text>
<line x1="420" y1="100" x2="470" y2="100" stroke="#64748b" stroke-width="3"/>
<rect x="470" y="75" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="550" y="97" text-anchor="middle" class="svg-ink" font-size="13">ISP AS 64500</text><text x="550" y="115" text-anchor="middle" class="svg-muted" font-size="12">sees one route</text>
</svg><p class="cap">With summary-only the ISP learns one /22 instead of four /24s.</p></div>

<h3>Verification</h3>
<pre class="out">CUST-EDGE# show ip bgp
     Network          Next Hop            Metric LocPrf Weight Path
<span class="hl"> *&gt;   192.168.48.0/22  0.0.0.0                            32768 i</span>
<span class="hl"> s&gt;   192.168.48.0     0.0.0.0                  0         32768 i</span>
 s&gt;   192.168.49.0     0.0.0.0                  0         32768 i
 s&gt;   192.168.50.0     0.0.0.0                  0         32768 i
 s&gt;   192.168.51.0     0.0.0.0                  0         32768 i

CUST-EDGE# show ip route 192.168.48.0 255.255.252.0
Routing entry for 192.168.48.0/22
<span class="hl">  Known via "bgp 65010", distance 200, metric 0, type locally generated</span>
  Routing Descriptor Blocks:
  * directly connected, via Null0

ISP# show ip bgp 192.168.48.0/22
BGP routing table entry for 192.168.48.0/22, version 12
Paths: (1 available, best #1, table default)
<span class="hl">  65010, (aggregated by 65010 10.10.10.10)</span>
    100.64.10.2 from 100.64.10.2 (10.10.10.10)
<span class="hl">      Origin IGP, localpref 100, valid, external, atomic-aggregate, best</span></pre>

<div class="eg"><p><b>Worked example: why as-set matters.</b> In lab 2, suppose R2 (AS 65102) summarised 172.31.1.0/24 (path <code>65101</code>) and 172.31.4.0/24 (path <code>65103 65104</code>) into 172.31.0.0/16. Without <code>as-set</code>, the aggregate starts a fresh path, so R3 receives <code>65102</code> and R4 receives <code>65103 65102</code>. R4 would accept a summary covering its <b>own</b> 172.31.4.0/24, pointing back towards the campus: a loop risk. With <code>aggregate-address 172.31.0.0 255.255.0.0 as-set</code>, the path becomes <code>65102 {65101,65103,65104}</code>. R3 sees 65103 inside the set and rejects it, and so would R4. The AS_SET counts as one AS in path length. Summarising here is a thought experiment only; do not add it in the lab, because the checks expect the /24s.</p></div>

<div class="warn"><p><b>Common mistake.</b> Configuring <code>aggregate-address</code> when none of the component prefixes are in the BGP table, for example because the <code>network</code> statements are missing. The aggregate simply does not appear. Components must be in BGP, not only in the routing table.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>summary-only</code> suppresses the specifics (<code>s</code>); without it both are sent. <code>as-set</code> adds an AS_SET and removes the atomic-aggregate flag. The Null0 route installed for an aggregate has AD <b>200</b>, as locally generated BGP routes do.</p></div>

<div class="scn"><h4>The summary that blackholed a new branch</h4><p>An enterprise summarised 10.40.0.0/16 towards its MPLS provider with <code>summary-only</code>. A new branch, 10.40.99.0/24, was connected through a different provider path and was not in this router's BGP table. Traffic arriving at the summarising router for 10.40.99.0/24 matched only the aggregate and was dropped by the Null0 route. The fix was to leak the specific route with a suppress-map and advertise the branch through its own path.</p><p><b>Lesson:</b> a summary claims the whole range; anything inside it that the summarising router cannot reach will be discarded by Null0.</p></div>

<div class="iv"><p class="q">"What is the difference between aggregate-address with and without summary-only and as-set?"</p><p>Strong answer: plain aggregate-address advertises the summary plus the specifics; summary-only suppresses the specifics; as-set replaces the ATOMIC_AGGREGATE flag with an AS_SET of all component ASes so that loop prevention still works. Mention that the aggregate needs at least one component in the BGP table, that a Null0 route with AD 200 is installed, and the alternative of a static Null0 route plus a network statement.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Summaries reduce table size and hide internal flaps.</li>
<li><code>aggregate-address</code> needs at least one more-specific prefix in the BGP table.</li>
<li><code>summary-only</code> suppresses the specifics (<code>s</code>); <code>suppress-map</code> suppresses selectively.</li>
<li>Without <code>as-set</code>: ATOMIC_AGGREGATE flag; with <code>as-set</code>: AS_SET for loop prevention.</li>
<li>A Null0 route (AD 200) is installed for the aggregate; static-to-Null0 plus <code>network</code> is the alternative.</li>
</ul></div>
`,hi:`
<p>Chaar floors wali company apne letterhead par chaar alag addresses nahi chhapti. Woh ek building address chhapti hai, aur reception desk post ko sahi floor par bhejti hai. Route summarisation yahi karta hai: duniya ko chaar /24 networks announce karne ki jagah aap ek /22 announce karte ho aur andar sahi subnet tak route karte ho. Kam routes matlab sabke liye chhoti tables, aur internal flaps chhupe rehte hain.</p>

<h3>Summary originate karne ke do tareeke</h3>
<ol>
<li><b>Null0 ka static route plus network statement.</b> <code>ip route 192.168.48.0 255.255.252.0 Null0</code> aur <code>network 192.168.48.0 mask 255.255.252.0</code>. Static route exact prefix ko RIB mein laata hai, isliye network statement match karta hai. Jab tak router up hai summary advertise hota hai, bhale hi har LAN down ho.</li>
<li><b><code>aggregate-address</code></b>, BGP ka apna tareeka. Yeh summary tabhi banata hai jab <b>BGP table mein kam se kam ek more-specific prefix</b> ho (sirf RIB mein hona kaafi nahi).</li>
</ol>

<h3>aggregate-address aur uske options</h3>
<p>Kaveri Textiles badh kar chaar LANs tak pahunch gayi hai, 192.168.48.0/24 se 192.168.51.0/24, har ek CUST-EDGE par apne <code>network</code> statement se advertise hota hai.</p>
<pre class="code">router bgp 65010
 network 192.168.48.0 mask 255.255.255.0
 network 192.168.49.0 mask 255.255.255.0
 network 192.168.50.0 mask 255.255.255.0
 network 192.168.51.0 mask 255.255.255.0
 aggregate-address 192.168.48.0 255.255.252.0 summary-only
<span class="c">! /22 advertise karo aur chaaron /24s suppress karo</span></pre>
<ul>
<li><b>Bina options</b>: aggregate <b>aur</b> saare more-specific routes advertise hote hain. Aam taur par yeh nahi chahiye.</li>
<li><b><code>summary-only</code></b>: sirf aggregate advertise hota hai; more-specifics <code>s</code> (suppressed) mark hote hain aur local rehte hain.</li>
<li><b><code>as-set</code></b>: aggregate ek <b>AS_SET</b> le jaata hai jisme component paths ke saare AS hote hain, jisse loop prevention chalta rehta hai. Iske bina aggregate ko <b>ATOMIC_AGGREGATE</b> flag milta hai yeh warn karne ke liye ki path detail kho gayi.</li>
<li><b><code>suppress-map</code></b>: sirf chune hue more-specifics suppress karo aur baaki leak karo.</li>
</ul>
<p>Har aggregate <b>AGGREGATOR</b> attribute bhi le jaata hai (ASN aur router ID jisne use banaya). Router ek matching <b>AD 200 wala Null0 route</b> install karta hai taaki summary ke un hisson ka traffic discard ho jo exist nahi karte, jisse loops rukte hain.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Chaar /24 prefixes ek /22 mein summarised">
<rect x="10" y="20" width="160" height="34" rx="6" fill="#e2e8f0"/><text x="90" y="42" text-anchor="middle" class="svg-ink" font-size="12">192.168.48.0/24  s</text>
<rect x="10" y="62" width="160" height="34" rx="6" fill="#e2e8f0"/><text x="90" y="84" text-anchor="middle" class="svg-ink" font-size="12">192.168.49.0/24  s</text>
<rect x="10" y="104" width="160" height="34" rx="6" fill="#e2e8f0"/><text x="90" y="126" text-anchor="middle" class="svg-ink" font-size="12">192.168.50.0/24  s</text>
<rect x="10" y="146" width="160" height="34" rx="6" fill="#e2e8f0"/><text x="90" y="168" text-anchor="middle" class="svg-ink" font-size="12">192.168.51.0/24  s</text>
<line x1="170" y1="37" x2="250" y2="100" stroke="#64748b"/><line x1="170" y1="79" x2="250" y2="100" stroke="#64748b"/><line x1="170" y1="121" x2="250" y2="100" stroke="#64748b"/><line x1="170" y1="163" x2="250" y2="100" stroke="#64748b"/>
<rect x="250" y="75" width="170" height="50" rx="8" fill="#bae6fd"/><text x="335" y="97" text-anchor="middle" class="svg-ink" font-size="13">192.168.48.0/22</text><text x="335" y="115" text-anchor="middle" class="svg-muted" font-size="12">CUST-EDGE aggregate</text>
<line x1="420" y1="100" x2="470" y2="100" stroke="#64748b" stroke-width="3"/>
<rect x="470" y="75" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="550" y="97" text-anchor="middle" class="svg-ink" font-size="13">ISP AS 64500</text><text x="550" y="115" text-anchor="middle" class="svg-muted" font-size="12">ek route dikhta hai</text>
</svg><p class="cap">summary-only ke saath ISP chaar /24s ki jagah ek /22 seekhta hai.</p></div>

<h3>Verification</h3>
<pre class="out">CUST-EDGE# show ip bgp
     Network          Next Hop            Metric LocPrf Weight Path
<span class="hl"> *&gt;   192.168.48.0/22  0.0.0.0                            32768 i</span>
<span class="hl"> s&gt;   192.168.48.0     0.0.0.0                  0         32768 i</span>
 s&gt;   192.168.49.0     0.0.0.0                  0         32768 i
 s&gt;   192.168.50.0     0.0.0.0                  0         32768 i
 s&gt;   192.168.51.0     0.0.0.0                  0         32768 i

CUST-EDGE# show ip route 192.168.48.0 255.255.252.0
Routing entry for 192.168.48.0/22
<span class="hl">  Known via "bgp 65010", distance 200, metric 0, type locally generated</span>
  Routing Descriptor Blocks:
  * directly connected, via Null0

ISP# show ip bgp 192.168.48.0/22
BGP routing table entry for 192.168.48.0/22, version 12
Paths: (1 available, best #1, table default)
<span class="hl">  65010, (aggregated by 65010 10.10.10.10)</span>
    100.64.10.2 from 100.64.10.2 (10.10.10.10)
<span class="hl">      Origin IGP, localpref 100, valid, external, atomic-aggregate, best</span></pre>

<div class="eg"><p><b>Worked example: as-set kyun zaroori hai.</b> Lab 2 mein socho R2 (AS 65102) ne 172.31.1.0/24 (path <code>65101</code>) aur 172.31.4.0/24 (path <code>65103 65104</code>) ko 172.31.0.0/16 mein summarise kiya. <code>as-set</code> ke bina aggregate naya path shuru karta hai, isliye R3 ko <code>65102</code> milta hai aur R4 ko <code>65103 65102</code>. R4 ek aisa summary accept kar lega jo uske <b>apne</b> 172.31.4.0/24 ko cover karta hai aur campus ki taraf wapas point karta hai: loop ka khatra. <code>aggregate-address 172.31.0.0 255.255.0.0 as-set</code> ke saath path <code>65102 {65101,65103,65104}</code> ban jaata hai. R3 set ke andar 65103 dekhta hai aur use reject karta hai, aur R4 bhi karega. AS_SET path length mein ek AS gina jaata hai. Yahan summarise karna sirf ek soch ka prayog hai; lab mein ise mat jodo, kyunki checks /24s expect karte hain.</p></div>

<div class="warn"><p><b>Common galti.</b> <code>aggregate-address</code> tab configure karna jab koi bhi component prefix BGP table mein na ho, jaise kyunki <code>network</code> statements missing hain. Aggregate bas dikhta hi nahi. Components BGP mein hone chahiye, sirf routing table mein nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>summary-only</code> specifics ko suppress karta hai (<code>s</code>); iske bina dono bheje jaate hain. <code>as-set</code> AS_SET jodta hai aur atomic-aggregate flag hatata hai. Aggregate ke liye install hue Null0 route ki AD <b>200</b> hai, jaisi locally generated BGP routes ki hoti hai.</p></div>

<div class="scn"><h4>Woh summary jisne nayi branch ko blackhole kar diya</h4><p>Ek enterprise ne apne MPLS provider ki taraf <code>summary-only</code> ke saath 10.40.0.0/16 summarise kiya. Ek nayi branch, 10.40.99.0/24, ek alag provider path se judi thi aur is router ki BGP table mein nahi thi. Summarising router par 10.40.99.0/24 ke liye aane wala traffic sirf aggregate se match hota tha aur Null0 route se drop ho jaata tha. Fix tha suppress-map se specific route leak karna aur branch ko uske apne path se advertise karna.</p><p><b>Seekh:</b> summary poori range ka daava karta hai; uske andar jo kuch summarising router nahi pahunch sakta, woh Null0 se discard hoga.</p></div>

<div class="iv"><p class="q">"summary-only aur as-set ke saath aur bina aggregate-address mein kya fark hai?"</p><p>Strong answer: plain aggregate-address summary plus specifics advertise karta hai; summary-only specifics suppress karta hai; as-set ATOMIC_AGGREGATE flag ki jagah saare component ASes ka AS_SET daalta hai taaki loop prevention chalta rahe. Batao ki aggregate ko BGP table mein kam se kam ek component chahiye, ki AD 200 wala Null0 route install hota hai, aur alternative static Null0 route plus network statement hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Summaries table size kam karte hain aur internal flaps chhupate hain.</li>
<li><code>aggregate-address</code> ko BGP table mein kam se kam ek more-specific prefix chahiye.</li>
<li><code>summary-only</code> specifics suppress karta hai (<code>s</code>); <code>suppress-map</code> selectively suppress karta hai.</li>
<li><code>as-set</code> ke bina: ATOMIC_AGGREGATE flag; <code>as-set</code> ke saath: loop prevention ke liye AS_SET.</li>
<li>Aggregate ke liye Null0 route (AD 200) install hota hai; static-to-Null0 plus <code>network</code> alternative hai.</li>
</ul></div>
`}};export{e as default};