var e={id:`loopbacks-nhs`,h:{en:`iBGP over IGP loopbacks: update-source and next-hop-self`,hi:`IGP loopbacks par iBGP: update-source aur next-hop-self`},body:{en:`
<p>Think of a desk phone and a mobile phone. If a colleague saves your desk extension, they lose you the moment you leave that desk. If they save your mobile number, they reach you whichever room you are in. A router's physical interface address is the desk phone: it disappears when that link fails. A <b>loopback</b> is the mobile number: it never goes down while the router is alive, and the IGP can reach it over any surviving path. That is why iBGP sessions are built between loopbacks.</p>

<h3>Step 1: the IGP carries the loopbacks</h3>
<p>In the Meridian lab every router runs <code>router ospf 1</code> with <code>network 10.0.0.0 0.255.255.255 area 0</code>, which covers the links (10.0.12.0/30, 10.0.23.0/30) and the loopbacks (10.255.0.1, .2, .3). Before touching BGP, prove it: <code>show ip route 10.255.0.3</code> on EDGE must show an OSPF route, and <code>ping 10.255.0.3 source Loopback0</code> must succeed. If the loopbacks are not reachable, no BGP command will help.</p>

<h3>Step 2: update-source on both ends</h3>
<p>BGP accepts a TCP connection only if its source address equals a configured neighbor address. By default a router sources its BGP packets from the outgoing interface, for example 10.0.12.1. The peer, which has <code>neighbor 10.255.0.1</code>, sees 10.0.12.1 and refuses the connection. <code>neighbor 10.255.0.2 update-source Loopback0</code> makes the router use its loopback as the source.</p>
<pre class="code"><span class="c">! BRANCH: join AS 65300 with sessions to EDGE and CORE</span>
router bgp 65300
 bgp router-id 10.255.0.3
 neighbor 10.255.0.1 remote-as 65300
 neighbor 10.255.0.1 update-source Loopback0
 neighbor 10.255.0.2 remote-as 65300
 neighbor 10.255.0.2 update-source Loopback0
<span class="c">! EDGE and CORE: the other end of each session</span>
router bgp 65300
 neighbor 10.255.0.3 remote-as 65300
 neighbor 10.255.0.3 update-source Loopback0</pre>
<p>iBGP packets use TTL 255 by default, so loopbacks several hops apart are fine. No multihop command is needed for iBGP; that is an eBGP topic (chapter 5).</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Next hop before and after next-hop-self">
<rect x="20" y="30" width="110" height="46" rx="8" fill="#fed7aa"/><text x="75" y="58" text-anchor="middle" class="svg-ink" font-size="13">ISP 100.64.0.1</text>
<rect x="200" y="30" width="120" height="46" rx="8" fill="#bae6fd"/><text x="260" y="58" text-anchor="middle" class="svg-ink" font-size="13">EDGE 10.255.0.1</text>
<rect x="420" y="30" width="120" height="46" rx="8" fill="#bae6fd"/><text x="480" y="58" text-anchor="middle" class="svg-ink" font-size="13">CORE 10.255.0.2</text>
<line x1="130" y1="53" x2="200" y2="53" stroke="#64748b" stroke-width="2"/><line x1="320" y1="53" x2="420" y2="53" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="110" width="600" height="36" rx="8" fill="#fde68a"/><text x="320" y="133" text-anchor="middle" class="svg-ink" font-size="13">Before: CORE sees next hop 100.64.0.1, not in OSPF, so inaccessible</text>
<rect x="20" y="158" width="600" height="36" rx="8" fill="#bbf7d0"/><text x="320" y="181" text-anchor="middle" class="svg-ink" font-size="13">After next-hop-self: next hop 10.255.0.1, reachable through OSPF, so best</text>
</svg><p class="cap">next-hop-self replaces the external next hop with the edge router's own peering address.</p></div>

<h3>Step 3: fix the next hop</h3>
<p>Here is lab task 1. CORE has the ISP prefix, but no best path:</p>
<pre class="out">CORE# show ip bgp 203.0.113.0
BGP routing table entry for 203.0.113.0/24, version 0
<span class="hl">Paths: (1 available, no best path)</span>
  Not advertised to any peer
  Refresh Epoch 1
  64999
<span class="hl">    100.64.0.1 (inaccessible) from 10.255.0.1 (10.255.0.1)</span>
      Origin IGP, metric 0, localpref 100, internal</pre>
<p>Read it line by line: one path, no best; the next hop 100.64.0.1 is the ISP's address, carried unchanged over iBGP, and CORE has no route to 100.64.0.0/30 because that link is not in OSPF. The fix on EDGE:</p>
<pre class="code">router bgp 65300
 neighbor 10.255.0.2 next-hop-self
 neighbor 10.255.0.3 next-hop-self   <span class="c">! also towards BRANCH (lab task 3)</span></pre>
<pre class="out">CORE# show ip bgp | begin Network
     Network          Next Hop            Metric LocPrf Weight Path
<span class="hl"> *&gt;i 203.0.113.0      10.255.0.1               0    100      0 64999 i</span></pre>
<p><code>*&gt;i</code> means valid, best, learned over iBGP. No session reset is needed: next-hop-self is an outbound change and IOS re-sends the updates.</p>
<p><b>The alternative:</b> put the edge link into OSPF, ideally as a passive interface (<code>network 100.64.0.0 0.0.0.3 area 0</code> plus <code>passive-interface g0/0</code>). It works, but every external link must then live in your IGP, and when a provider link goes down the next hop disappears only after OSPF reconverges. Most designs prefer next-hop-self on edge routers.</p>

<h3>Step 4: advertise the branch and test end to end</h3>
<pre class="code"><span class="c">! BRANCH (lab task 4)</span>
router bgp 65300
 network 172.16.30.0 mask 255.255.255.0</pre>
<pre class="out">BRANCH# show ip bgp | begin Network
     Network          Next Hop            Metric LocPrf Weight Path
 *&gt;  172.16.30.0/24   0.0.0.0                  0         32768 i
<span class="hl"> *&gt;i 203.0.113.0      10.255.0.1               0    100      0 64999 i</span>

ISP# show ip bgp | include 172.16.30
<span class="hl"> *&gt;  172.16.30.0/24   100.64.0.2               0             0 65300 i</span></pre>
<p>BRANCH learns the ISP prefix <b>directly from EDGE</b>, not through CORE, because CORE obeys split horizon. EDGE sends the branch LAN to the ISP with 65300 prepended. Lab task 5 then pings 203.0.113.1 from PC3: BRANCH forwards to 10.255.0.1 (resolved recursively through OSPF towards CORE), CORE has its own BGP route to the same next hop, and EDGE hands the packet to the ISP.</p>

<div class="eg"><p><b>Worked example: recursive lookup.</b> BRANCH needs to reach 203.0.113.1. BGP says next hop 10.255.0.1. The routing table says 10.255.0.1/32 is reachable via OSPF through 10.0.23.1 (CORE), interface g0/1. So the packet leaves g0/1 towards CORE. CORE repeats the lookup: 203.0.113.0/24 via 10.255.0.1, which OSPF resolves to 10.0.12.1 on g0/0. Two lookups per router, one BGP and one IGP.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Configuring update-source on only one side: the session may still come up when the correctly configured router happens to open the TCP connection, then fail after a reset, which looks random. Configuring next-hop-self on the internal router instead of the edge router has no useful effect. Forgetting that locally originated routes use the update-source address as next hop, so that address must be in the IGP.</p></div>

<div class="exam"><p><b>Exam traps.</b> The keyword <i>inaccessible</i> in <code>show ip bgp PREFIX</code> points to next-hop reachability, never to a filter. <code>next-hop-self</code> is configured per neighbor on the router that learned the eBGP route. <code>ebgp-multihop</code> is never needed for iBGP.</p></div>

<div class="scn"><h4>Session flaps every time the fibre is cleaned</h4><p>A bank peered iBGP between physical interface addresses of two data center routers connected by two links. Whenever the first link went down for maintenance, the BGP session dropped for three minutes (hold timer) even though OSPF rerouted instantly over the second link. The engineer moved both peers to Loopback0 with update-source and confirmed the loopbacks were in OSPF. The next maintenance window caused zero BGP events.</p><p><b>Lesson:</b> peer on loopbacks, let the IGP handle link failures.</p></div>

<div class="iv"><p class="q">"What does next-hop-self do and where do you configure it?"</p><p>Explain that iBGP leaves the eBGP next hop unchanged, so internal routers need a route to the external peer's address. next-hop-self, configured on the edge router per iBGP neighbor, rewrites the next hop to the edge router's own update-source address (usually its loopback), which the IGP already carries. Mention the alternative (external link as passive interface in the IGP) and why most designs choose next-hop-self.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Verify loopback reachability through the IGP before touching BGP.</li>
<li>update-source Loopback0 on both ends; iBGP needs no multihop because TTL is 255.</li>
<li><i>inaccessible</i> next hop means no route to it; next-hop-self on the edge fixes it.</li>
<li><code>*&gt;i</code> = valid, best, internal; locally originated routes show next hop 0.0.0.0 and weight 32768.</li>
<li>Forwarding uses a recursive lookup: BGP gives the next hop, the IGP gives the interface.</li>
</ul></div>
`,hi:`
<p>Desk phone aur mobile phone ke baare mein socho. Agar colleague aapka desk extension save kare, to aap desk chhodte hi woh aapko kho deta hai. Agar woh aapka mobile number save kare, to aap kisi bhi room mein ho, woh aap tak pahunch jaata hai. Router ka physical interface address desk phone hai: link fail hote hi gayab. <b>Loopback</b> mobile number hai: jab tak router zinda hai woh kabhi down nahi hota, aur IGP use kisi bhi bache hue path se reach kar sakta hai. Isiliye iBGP sessions loopbacks ke beech banaye jaate hain.</p>

<h3>Step 1: IGP loopbacks ko carry karta hai</h3>
<p>Meridian lab mein har router <code>router ospf 1</code> ke saath <code>network 10.0.0.0 0.255.255.255 area 0</code> chalata hai, jo links (10.0.12.0/30, 10.0.23.0/30) aur loopbacks (10.255.0.1, .2, .3) ko cover karta hai. BGP chhoone se pehle ise prove karo: EDGE par <code>show ip route 10.255.0.3</code> mein OSPF route dikhna chahiye, aur <code>ping 10.255.0.3 source Loopback0</code> successful hona chahiye. Agar loopbacks reachable nahi hain, to koi BGP command madad nahi karegi.</p>

<h3>Step 2: dono ends par update-source</h3>
<p>BGP TCP connection tabhi accept karta hai jab uska source address kisi configured neighbor address ke barabar ho. Default mein router apne BGP packets outgoing interface se source karta hai, jaise 10.0.12.1. Peer, jiske paas <code>neighbor 10.255.0.1</code> hai, 10.0.12.1 dekhta hai aur connection refuse kar deta hai. <code>neighbor 10.255.0.2 update-source Loopback0</code> router ko source ke roop mein apna loopback use karwata hai.</p>
<pre class="code"><span class="c">! BRANCH: EDGE aur CORE ke saath sessions ke saath AS 65300 join karo</span>
router bgp 65300
 bgp router-id 10.255.0.3
 neighbor 10.255.0.1 remote-as 65300
 neighbor 10.255.0.1 update-source Loopback0
 neighbor 10.255.0.2 remote-as 65300
 neighbor 10.255.0.2 update-source Loopback0
<span class="c">! EDGE aur CORE: har session ka dusra end</span>
router bgp 65300
 neighbor 10.255.0.3 remote-as 65300
 neighbor 10.255.0.3 update-source Loopback0</pre>
<p>iBGP packets default mein TTL 255 use karte hain, isliye kai hops door loopbacks theek hain. iBGP ke liye koi multihop command nahi chahiye; woh eBGP ka topic hai (chapter 5).</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="next-hop-self se pehle aur baad next hop">
<rect x="20" y="30" width="110" height="46" rx="8" fill="#fed7aa"/><text x="75" y="58" text-anchor="middle" class="svg-ink" font-size="13">ISP 100.64.0.1</text>
<rect x="200" y="30" width="120" height="46" rx="8" fill="#bae6fd"/><text x="260" y="58" text-anchor="middle" class="svg-ink" font-size="13">EDGE 10.255.0.1</text>
<rect x="420" y="30" width="120" height="46" rx="8" fill="#bae6fd"/><text x="480" y="58" text-anchor="middle" class="svg-ink" font-size="13">CORE 10.255.0.2</text>
<line x1="130" y1="53" x2="200" y2="53" stroke="#64748b" stroke-width="2"/><line x1="320" y1="53" x2="420" y2="53" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="110" width="600" height="36" rx="8" fill="#fde68a"/><text x="320" y="133" text-anchor="middle" class="svg-ink" font-size="13">Pehle: CORE next hop 100.64.0.1 dekhta hai, OSPF mein nahi, isliye inaccessible</text>
<rect x="20" y="158" width="600" height="36" rx="8" fill="#bbf7d0"/><text x="320" y="181" text-anchor="middle" class="svg-ink" font-size="13">next-hop-self ke baad: next hop 10.255.0.1, OSPF se reachable, isliye best</text>
</svg><p class="cap">next-hop-self external next hop ko edge router ke apne peering address se replace karta hai.</p></div>

<h3>Step 3: next hop fix karo</h3>
<p>Yeh lab task 1 hai. CORE ke paas ISP prefix hai, par best path nahi:</p>
<pre class="out">CORE# show ip bgp 203.0.113.0
BGP routing table entry for 203.0.113.0/24, version 0
<span class="hl">Paths: (1 available, no best path)</span>
  Not advertised to any peer
  Refresh Epoch 1
  64999
<span class="hl">    100.64.0.1 (inaccessible) from 10.255.0.1 (10.255.0.1)</span>
      Origin IGP, metric 0, localpref 100, internal</pre>
<p>Line by line padho: ek path, koi best nahi; next hop 100.64.0.1 ISP ka address hai, iBGP par bina badle aaya, aur CORE ke paas 100.64.0.0/30 ka route nahi kyunki woh link OSPF mein nahi hai. EDGE par fix:</p>
<pre class="code">router bgp 65300
 neighbor 10.255.0.2 next-hop-self
 neighbor 10.255.0.3 next-hop-self   <span class="c">! BRANCH ki taraf bhi (lab task 3)</span></pre>
<pre class="out">CORE# show ip bgp | begin Network
     Network          Next Hop            Metric LocPrf Weight Path
<span class="hl"> *&gt;i 203.0.113.0      10.255.0.1               0    100      0 64999 i</span></pre>
<p><code>*&gt;i</code> matlab valid, best, iBGP se seekha. Session reset ki zaroorat nahi: next-hop-self outbound change hai aur IOS updates dobara bhej deta hai.</p>
<p><b>Alternative:</b> edge link ko OSPF mein daalo, behtar hai passive interface ki tarah (<code>network 100.64.0.0 0.0.0.3 area 0</code> plus <code>passive-interface g0/0</code>). Yeh kaam karta hai, par tab har external link aapke IGP mein rehna chahiye, aur provider link girne par next hop sirf OSPF reconverge hone ke baad gayab hota hai. Zyada tar designs edge routers par next-hop-self prefer karte hain.</p>

<h3>Step 4: branch advertise karo aur end to end test karo</h3>
<pre class="code"><span class="c">! BRANCH (lab task 4)</span>
router bgp 65300
 network 172.16.30.0 mask 255.255.255.0</pre>
<pre class="out">BRANCH# show ip bgp | begin Network
     Network          Next Hop            Metric LocPrf Weight Path
 *&gt;  172.16.30.0/24   0.0.0.0                  0         32768 i
<span class="hl"> *&gt;i 203.0.113.0      10.255.0.1               0    100      0 64999 i</span>

ISP# show ip bgp | include 172.16.30
<span class="hl"> *&gt;  172.16.30.0/24   100.64.0.2               0             0 65300 i</span></pre>
<p>BRANCH ISP prefix <b>seedha EDGE se</b> seekhta hai, CORE ke through nahi, kyunki CORE split horizon follow karta hai. EDGE branch LAN ko ISP ko 65300 prepend karke bhejta hai. Lab task 5 phir PC3 se 203.0.113.1 ping karta hai: BRANCH 10.255.0.1 ki taraf forward karta hai (OSPF ke through CORE ki taraf recursively resolve hota hai), CORE ke paas usi next hop ka apna BGP route hai, aur EDGE packet ISP ko de deta hai.</p>

<div class="eg"><p><b>Worked example: recursive lookup.</b> BRANCH ko 203.0.113.1 tak pahunchna hai. BGP kehta hai next hop 10.255.0.1. Routing table kehti hai 10.255.0.1/32 OSPF se 10.0.23.1 (CORE) ke through, interface g0/1 par reachable hai. Isliye packet g0/1 se CORE ki taraf nikalta hai. CORE lookup dohraata hai: 203.0.113.0/24 via 10.255.0.1, jise OSPF g0/0 par 10.0.12.1 tak resolve karta hai. Har router par do lookups, ek BGP aur ek IGP.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Update-source sirf ek side configure karna: session tab bhi up ho sakta hai jab sahi configured router TCP connection khole, phir reset ke baad fail ho jaata hai, jo random lagta hai. next-hop-self edge router ki jagah internal router par configure karne ka koi faayda nahi. Yeh bhoolna ki locally originated routes next hop ke roop mein update-source address use karte hain, isliye woh address IGP mein hona chahiye.</p></div>

<div class="exam"><p><b>Exam traps.</b> <code>show ip bgp PREFIX</code> mein <i>inaccessible</i> keyword next-hop reachability ki taraf ishara karta hai, kabhi filter ki taraf nahi. <code>next-hop-self</code> us router par per neighbor configure hota hai jisne eBGP route seekha. iBGP ke liye <code>ebgp-multihop</code> kabhi nahi chahiye.</p></div>

<div class="scn"><h4>Har baar fibre saaf hone par session flap</h4><p>Ek bank ne do data center routers ke physical interface addresses ke beech iBGP peer kiya tha, jo do links se jude the. Jab bhi pehla link maintenance ke liye down hota, BGP session teen minute (hold timer) ke liye gir jaata, jabki OSPF turant dusre link par reroute kar deta tha. Engineer ne dono peers ko update-source ke saath Loopback0 par shift kiya aur confirm kiya ki loopbacks OSPF mein hain. Agli maintenance window mein zero BGP events hue.</p><p><b>Seekh:</b> loopbacks par peer karo, link failures IGP ko sambhalne do.</p></div>

<div class="iv"><p class="q">"next-hop-self kya karta hai aur ise kahan configure karte ho?"</p><p>Samjhao ki iBGP eBGP wala next hop nahi badalta, isliye internal routers ko external peer ke address ka route chahiye. next-hop-self, edge router par har iBGP neighbor ke liye configure hota hai, aur next hop ko edge router ke apne update-source address (aam taur par loopback) se badal deta hai, jise IGP pehle se carry karta hai. Alternative batao (external link ko IGP mein passive interface ki tarah) aur zyada tar designs next-hop-self kyun chunte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BGP chhoone se pehle IGP ke through loopback reachability verify karo.</li>
<li>Dono ends par update-source Loopback0; iBGP ko multihop nahi chahiye kyunki TTL 255 hai.</li>
<li><i>inaccessible</i> next hop matlab uska route nahi; edge par next-hop-self fix karta hai.</li>
<li><code>*&gt;i</code> = valid, best, internal; locally originated routes next hop 0.0.0.0 aur weight 32768 dikhate hain.</li>
<li>Forwarding recursive lookup use karta hai: BGP next hop deta hai, IGP interface deta hai.</li>
</ul></div>
`}};export{e as default};