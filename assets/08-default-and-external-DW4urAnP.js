var e={id:`default-external`,h:{en:`Default and external routes: originate, E1 and E2`,hi:`Default aur external routes: originate, E1 aur E2`},body:{en:`
<p>Your office does not keep a map of every road in India. For anything you do not know, you follow one rule: 'if it is not in my city, take the highway to the airport'. That rule is a default route. In a company network the airport is the internet edge router. Instead of loading thousands of internet prefixes into OSPF, the edge router tells everybody: 'send unknown traffic to me'. In OSPF, a route that comes from outside the OSPF domain is called <b>external</b>, and the router that brings it in is the ASBR.</p>

<h3>Giving OSPF a default route</h3>
<p>There are two parts: the edge router needs its own way out (usually a static default route to the ISP), and it must be told to advertise it:</p>
<pre class="code">R3(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.2
R3(config)# router ospf 1
R3(config-router)# default-information originate</pre>
<p>This turns R3 into an ASBR. It creates a type 5 LSA for 0.0.0.0/0 and floods it to the whole domain. The ABR passes it into area 1 and adds a type 4 for the ASBR (chapter 3). Every router now installs the default route:</p>
<pre class="out">R1# show ip route 0.0.0.0
Routing entry for 0.0.0.0/0
  Known via "ospf 1", distance 110, metric 1, type extern 2
  Routing Descriptor Blocks:
  * 10.0.12.2, via GigabitEthernet0/0

R1# show ip ospf database external

            OSPF Router with ID (1.1.1.1) (Process ID 1)

		Type-5 AS External Link States

  LS age: 60
  Options: (No TOS-capability, DC, Upward)
  LS Type: AS External Link
  Link State ID: 0.0.0.0 (External Network Number )
  Advertising Router: 3.3.3.3
  LS Seq Number: 80000001
  Checksum: 0xB8BC
  Length: 36
  Network Mask: /0
        Metric Type: 2 (Larger than any link state path)
        MTID: 0
        Metric: 1
        Forward Address: 0.0.0.0
        External Route Tag: 0</pre>
<p>The route is type extern 2 (E2), with metric 1, advertised by 3.3.3.3. 'Forward Address 0.0.0.0' means: send to the advertising router itself, not to some other next hop.</p>

<h3>Only when the router has a default</h3>
<p>The plain command is conditional: the router originates the default only while it has a default route of its own in the routing table. If the static route disappears (the ISP link goes down and the route is removed), the type 5 LSA is withdrawn. Then the whole network loses its default:</p>
<pre class="out">R1# show ip route 0.0.0.0
% Network not in table</pre>
<p>That behaviour is useful: it stops a router from attracting traffic for an exit it no longer has. Add the <code>always</code> keyword if you want the router to advertise a default regardless:</p>
<pre class="code">R3(config-router)# default-information originate always</pre>
<p>With <code>always</code> the default stays even when the ISP link is down, and R1 keeps <code>O*E2 0.0.0.0/0</code> pointing at R3, which then drops the traffic. Use it deliberately, for example when the exit is provided by a non-routed method, or when two edge routers must both advertise at all times.</p>

<h3>E1 and E2</h3>
<p>External routes carry a metric set by the ASBR and a <b>metric type</b>. You choose it with the command:</p>
<pre class="code">R3(config-router)# default-information originate metric 20 metric-type 1</pre>
<div class="tbl"><table>
<tr><th></th><th>Type 2 (E2, default)</th><th>Type 1 (E1)</th></tr>
<tr><td>Metric on other routers</td><td>The ASBR's value, never increased</td><td>The ASBR's value plus the internal cost to reach the ASBR</td></tr>
<tr><td>Behaviour</td><td>Same metric everywhere: the closest-exit decision is not made on cost to the ASBR (it is only a tie-breaker)</td><td>Metric grows with distance, so routers prefer the nearer exit</td></tr>
<tr><td>Use when</td><td>One exit, or exits that should be equal</td><td>Several exits and you want the closest</td></tr>
<tr><td>Route code</td><td><code>O E2</code>, <code>O*E2</code></td><td><code>O E1</code>, <code>O*E1</code></td></tr>
</table></div>
<p>Here is the same network after R3 originates E1 with metric 20. The number changes by router:</p>
<pre class="out">R2# show ip route 0.0.0.0
Routing entry for 0.0.0.0/0
  Known via "ospf 1", distance 110, metric 21, type extern 1
  Routing Descriptor Blocks:
  * 10.0.23.2, via GigabitEthernet0/1

R1# show ip route 0.0.0.0
Routing entry for 0.0.0.0/0
  Known via "ospf 1", distance 110, metric 22, type extern 1
  Routing Descriptor Blocks:
  * 10.0.12.2, via GigabitEthernet0/0

R1# show ip route ospf
Gateway of last resort is 10.0.12.2 to network 0.0.0.0

<span class="hl">O*E1     0.0.0.0/0 [110/22] via 10.0.12.2, 00:00:10, GigabitEthernet0/0</span></pre>
<p>R3 advertised 20. R2 is one link away from the ASBR (cost 1) and sees 21. R1 is two links away (cost 2) and sees 22. Under E2, both would show 1, the number the ASBR gave.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="E1 adds internal cost along the path from the ASBR, E2 keeps the same value">
<rect x="20" y="60" width="100" height="44" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="70" y="86" text-anchor="middle" class="svg-ink" font-size="13">R3 ASBR</text>
<rect x="270" y="60" width="100" height="44" rx="8" fill="#fff" stroke="#64748b"/><text x="320" y="86" text-anchor="middle" class="svg-ink" font-size="13">R2 ABR</text>
<rect x="520" y="60" width="100" height="44" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="570" y="86" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<line x1="120" y1="82" x2="270" y2="82" stroke="#64748b" stroke-width="3"/><line x1="370" y1="82" x2="520" y2="82" stroke="#64748b" stroke-width="3"/>
<text x="195" y="74" text-anchor="middle" class="svg-muted" font-size="11">cost 1</text><text x="445" y="74" text-anchor="middle" class="svg-muted" font-size="11">cost 1</text>
<text x="70" y="130" text-anchor="middle" class="svg-ink" font-size="12">E1: 20</text><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="12">E1: 21</text><text x="570" y="130" text-anchor="middle" class="svg-ink" font-size="12">E1: 22</text>
<text x="70" y="154" text-anchor="middle" class="svg-accent" font-size="12">E2: 20</text><text x="320" y="154" text-anchor="middle" class="svg-accent" font-size="12">E2: 20</text><text x="570" y="154" text-anchor="middle" class="svg-accent" font-size="12">E2: 20</text>
</svg><p class="cap">The same external metric of 20: E1 grows by the internal cost at every router, E2 stays fixed.</p></div>

<div class="eg"><p><b>Worked example.</b> A company has two internet exits: Mumbai ASBR (M) and Chennai ASBR (C). Both originate the default with metric 10. A router in Pune is 2 away from M and 6 away from C. As E1: M route = 10 + 2 = 12, C route = 10 + 6 = 16; Pune chooses M. A router in Coimbatore is 7 away from M and 1 from C: M = 17, C = 11; it picks C. Each region uses its closest exit. As E2: both routes show 10 on every router. The tie is broken by the lower cost to the ASBR, which gives the same answer here, but if C had advertised metric 5, every router in the company would prefer C regardless of distance, because E2 compares the external metric first. That is the practical difference: E2 puts policy in the metric, E1 makes distance matter.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Configuring <code>default-information originate</code> and forgetting the static default underneath: nothing is advertised. Using <code>always</code> on an edge router that has lost its ISP, which keeps attracting traffic to a dead exit. Mixing E1 and E2 from different ASBRs and expecting metrics to be compared: E1 wins before the values are looked at. Running OSPF out to the ISP. And expecting a default route in a stub-style area without knowing that stubs are a design choice, not the default (see below).</p></div>

<div class="exam"><p><b>Exam traps.</b> <code>default-information originate</code> advertises a default only if the router already has one, unless <code>always</code> is added. The default route is an external type 5 route, shown as O*E2 by default. E2 metric stays constant; E1 adds internal cost. Route preference: E1 before E2. The asterisk marks the candidate default and the Gateway of last resort line follows it.</p></div>

<div class="scn"><h4>The ISP went down and the default stayed</h4><p>A logistics firm configured <code>default-information originate always</code> on both edge routers 'to be safe'. During an ISP outage at the Pune edge, its default route stayed in OSPF. Half the branches kept sending internet traffic to Pune, which discarded it, while the working Chennai edge sat nearly idle. Removing <code>always</code> made the Pune router withdraw its default when its static route vanished, and every branch moved to Chennai on its own.</p><p><b>Lesson:</b> the conditional form is the safer default. Use <code>always</code> only when you can explain why.</p></div>

<div class="iv"><p class="q">'How do you advertise a default route into OSPF, and what are E1 and E2?'</p><p>Strong answer: put a static default (or a default learned elsewhere) on the edge router and use <code>default-information originate</code> under OSPF. That router becomes an ASBR and floods a type 5 LSA. The default is E2 unless I add <code>metric-type 1</code>. With E2 the metric is the same everywhere, with E1 each router adds its internal cost to the ASBR, so E1 is better when there are several exits. I would mention the <code>always</code> keyword and its risk.</p></div>

<h3>A short pointer: stub, totally stubby and NSSA</h3>
<p>Large networks often block type 5 LSAs (and sometimes type 3) from entering small areas, and replace them with a default route from the ABR. These designs are called <b>stub</b>, <b>totally stubby</b> and <b>NSSA</b> areas. They are not part of the CCNA exam; you meet them in CCNP ENARSI. Just remember the purpose: even smaller LSDBs in small areas.</p>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>default-information originate</code> on an ASBR floods a type 5 default; it needs an existing default unless <code>always</code> is used.</li>
<li>External routes arrive as E2 by default; <code>metric-type 1</code> makes them E1.</li>
<li>E2 keeps the ASBR's metric on every router; E1 adds the internal cost, so it suits several exits.</li>
<li>Routers need the ASBR address (type 4 from the ABR) to use a type 5 route.</li>
</ul></div>
`,hi:`
<p>Aapka office India ki har sadak ka map nahi rakhta. Jo cheez nahi pata, uske liye ek hi rule follow karte hain: 'agar mere shehar mein nahi hai, to highway lekar airport jao'. Woh rule default route hai. Company network mein airport internet edge router hai. OSPF mein hazaaron internet prefixes load karne ki jagah edge router sabko kehta hai: 'unknown traffic mujhe bhejo'. OSPF mein jo route OSPF domain ke bahar se aata hai use <b>external</b> kehte hain, aur use laane wala router ASBR hai.</p>

<h3>OSPF ko default route dena</h3>
<p>Do hisse hain: edge router ke paas apna bahar nikalne ka raasta chahiye (aam taur par ISP ki taraf static default route), aur use bataana padta hai ki ise advertise kare:</p>
<pre class="code">R3(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.2
R3(config)# router ospf 1
R3(config-router)# default-information originate</pre>
<p>Isse R3 ASBR ban jaata hai. Woh 0.0.0.0/0 ke liye type 5 LSA banata hai aur poore domain mein flood karta hai. ABR use area 1 mein pass karta hai aur ASBR ke liye type 4 jodta hai (chapter 3). Ab har router default route install karta hai:</p>
<pre class="out">R1# show ip route 0.0.0.0
Routing entry for 0.0.0.0/0
  Known via "ospf 1", distance 110, metric 1, type extern 2
  Routing Descriptor Blocks:
  * 10.0.12.2, via GigabitEthernet0/0

R1# show ip ospf database external

            OSPF Router with ID (1.1.1.1) (Process ID 1)

		Type-5 AS External Link States

  LS age: 60
  Options: (No TOS-capability, DC, Upward)
  LS Type: AS External Link
  Link State ID: 0.0.0.0 (External Network Number )
  Advertising Router: 3.3.3.3
  LS Seq Number: 80000001
  Checksum: 0xB8BC
  Length: 36
  Network Mask: /0
        Metric Type: 2 (Larger than any link state path)
        MTID: 0
        Metric: 1
        Forward Address: 0.0.0.0
        External Route Tag: 0</pre>
<p>Route type extern 2 (E2) hai, metric 1, aur 3.3.3.3 ne advertise kiya. 'Forward Address 0.0.0.0' ka matlab: advertising router ko hi bhejo, kisi aur next hop ko nahi.</p>

<h3>Sirf tab jab router ke paas default ho</h3>
<p>Plain command conditional hai: router default tabhi originate karta hai jab uske apne routing table mein default route ho. Agar static route chala jaaye (ISP link down hone par route hat jaata hai), to type 5 LSA withdraw ho jaata hai. Phir poora network apna default kho deta hai:</p>
<pre class="out">R1# show ip route 0.0.0.0
% Network not in table</pre>
<p>Yeh behaviour kaam ka hai: router ko aise exit ka traffic kheenchne se rokta hai jo ab uske paas nahi hai. Agar router ko hamesha default advertise karna hai to <code>always</code> keyword jodo:</p>
<pre class="code">R3(config-router)# default-information originate always</pre>
<p><code>always</code> ke saath ISP link down hone par bhi default bana rehta hai, aur R1 ke paas <code>O*E2 0.0.0.0/0</code> R3 ki taraf point karta rehta hai, jo phir traffic gira deta hai. Ise soch samajhkar use karo, jaise jab exit non-routed tareeke se mila ho, ya do edge routers ko hamesha advertise karna ho.</p>

<h3>E1 aur E2</h3>
<p>External routes ke saath ASBR ka set kiya metric aur ek <b>metric type</b> aata hai. Command se chunte ho:</p>
<pre class="code">R3(config-router)# default-information originate metric 20 metric-type 1</pre>
<div class="tbl"><table>
<tr><th></th><th>Type 2 (E2, default)</th><th>Type 1 (E1)</th></tr>
<tr><td>Dusre routers par metric</td><td>ASBR ki value, kabhi badhti nahi</td><td>ASBR ki value plus ASBR tak internal cost</td></tr>
<tr><td>Behaviour</td><td>Har jagah same metric: nazdeeki exit ka faisla ASBR tak ki cost se nahi hota (woh sirf tie-breaker hai)</td><td>Door jaane par metric badhta hai, isliye routers paas wala exit prefer karte hain</td></tr>
<tr><td>Kab use karein</td><td>Ek exit, ya aise exits jo barabar hone chahiye</td><td>Kai exits aur sabse nazdeeki chahiye</td></tr>
<tr><td>Route code</td><td><code>O E2</code>, <code>O*E2</code></td><td><code>O E1</code>, <code>O*E1</code></td></tr>
</table></div>
<p>Yeh wahi network hai jab R3 metric 20 ke saath E1 originate karta hai. Number router ke hisaab se badalta hai:</p>
<pre class="out">R2# show ip route 0.0.0.0
Routing entry for 0.0.0.0/0
  Known via "ospf 1", distance 110, metric 21, type extern 1
  Routing Descriptor Blocks:
  * 10.0.23.2, via GigabitEthernet0/1

R1# show ip route 0.0.0.0
Routing entry for 0.0.0.0/0
  Known via "ospf 1", distance 110, metric 22, type extern 1
  Routing Descriptor Blocks:
  * 10.0.12.2, via GigabitEthernet0/0

R1# show ip route ospf
Gateway of last resort is 10.0.12.2 to network 0.0.0.0

<span class="hl">O*E1     0.0.0.0/0 [110/22] via 10.0.12.2, 00:00:10, GigabitEthernet0/0</span></pre>
<p>R3 ne 20 advertise kiya. R2 ASBR se ek link door hai (cost 1) aur 21 dekhta hai. R1 do links door hai (cost 2) aur 22 dekhta hai. E2 mein dono 1 dikhate, jo number ASBR ne diya.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="E1 ASBR se path par internal cost jodta hai, E2 wahi value rakhta hai">
<rect x="20" y="60" width="100" height="44" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="70" y="86" text-anchor="middle" class="svg-ink" font-size="13">R3 ASBR</text>
<rect x="270" y="60" width="100" height="44" rx="8" fill="#fff" stroke="#64748b"/><text x="320" y="86" text-anchor="middle" class="svg-ink" font-size="13">R2 ABR</text>
<rect x="520" y="60" width="100" height="44" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="570" y="86" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<line x1="120" y1="82" x2="270" y2="82" stroke="#64748b" stroke-width="3"/><line x1="370" y1="82" x2="520" y2="82" stroke="#64748b" stroke-width="3"/>
<text x="195" y="74" text-anchor="middle" class="svg-muted" font-size="11">cost 1</text><text x="445" y="74" text-anchor="middle" class="svg-muted" font-size="11">cost 1</text>
<text x="70" y="130" text-anchor="middle" class="svg-ink" font-size="12">E1: 20</text><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="12">E1: 21</text><text x="570" y="130" text-anchor="middle" class="svg-ink" font-size="12">E1: 22</text>
<text x="70" y="154" text-anchor="middle" class="svg-accent" font-size="12">E2: 20</text><text x="320" y="154" text-anchor="middle" class="svg-accent" font-size="12">E2: 20</text><text x="570" y="154" text-anchor="middle" class="svg-accent" font-size="12">E2: 20</text>
</svg><p class="cap">Wahi external metric 20: E1 har router par internal cost se badhta hai, E2 fixed rehta hai.</p></div>

<div class="eg"><p><b>Worked example.</b> Ek company ke do internet exits hain: Mumbai ASBR (M) aur Chennai ASBR (C). Dono default ko metric 10 ke saath originate karte hain. Pune ka router M se 2 aur C se 6 door hai. E1 mein: M route = 10 + 2 = 12, C route = 10 + 6 = 16; Pune M chunta hai. Coimbatore ka router M se 7 aur C se 1 door hai: M = 17, C = 11; woh C chunta hai. Har region apna nazdeeki exit use karta hai. E2 mein: har router par dono routes 10 dikhate hain. Tie ASBR tak kam cost se tutta hai, jo yahan wahi jawab deta hai, lekin agar C ne metric 5 advertise kiya hota, to company ka har router door hone ke bawajood C ko prefer karta, kyunki E2 pehle external metric compare karta hai. Practical farak yahi hai: E2 metric mein policy daalta hai, E1 distance ko matter karata hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> <code>default-information originate</code> likhna aur neeche static default bhool jaana: kuch advertise nahi hota. ISP kho chuke edge router par <code>always</code> use karna, jo traffic ko mare hue exit ki taraf kheenchta rehta hai. Alag ASBRs se E1 aur E2 mix karke metrics compare hone ki ummeed: E1 values dekhne se pehle hi jeet jaata hai. ISP ki taraf OSPF chalana. Aur stub-style area mein default route milne ki ummeed bina jaane ki stubs design ka choice hain, default nahi (neeche dekho).</p></div>

<div class="exam"><p><b>Exam traps.</b> <code>default-information originate</code> default tabhi advertise karta hai jab router ke paas pehle se ho, jab tak <code>always</code> na jode. Default route external type 5 route hai, jo default mein O*E2 dikhta hai. E2 metric constant rehta hai; E1 internal cost jodta hai. Route preference: E1 pehle, E2 baad mein. Asterisk candidate default mark karta hai aur Gateway of last resort line uske baad aati hai.</p></div>

<div class="scn"><h4>ISP gaya, default raha</h4><p>Ek logistics firm ne 'safe rehne ke liye' dono edge routers par <code>default-information originate always</code> lagaya. Pune edge par ISP outage ke time uska default OSPF mein bana raha. Aadhe branches internet traffic Pune ko bhejte rahe, jo use gira deta tha, jabki chalta hua Chennai edge lagbhag khaali baitha raha. <code>always</code> hatate hi Pune router ne apna default withdraw kiya jab uska static route gaya, aur har branch apne aap Chennai chala gaya.</p><p><b>Seekh:</b> conditional form zyada safe default hai. <code>always</code> tabhi use karo jab wajah bata sako.</p></div>

<div class="iv"><p class="q">'OSPF mein default route kaise advertise karte ho, aur E1 aur E2 kya hain?'</p><p>Strong answer: edge router par static default (ya kahin aur se seekha default) rakho aur OSPF ke andar <code>default-information originate</code> use karo. Woh router ASBR ban jaata hai aur type 5 LSA flood karta hai. Default E2 hota hai jab tak main <code>metric-type 1</code> na jodun. E2 mein metric har jagah same rehta hai, E1 mein har router ASBR tak internal cost jodta hai, isliye kai exits hon to E1 behtar hai. Main <code>always</code> keyword aur uska risk bhi bataunga.</p></div>

<h3>Ek chhota pointer: stub, totally stubby aur NSSA</h3>
<p>Bade networks aksar type 5 LSAs (kabhi type 3 bhi) ko chhote areas mein ghusne se rokte hain, aur unki jagah ABR se ek default route dete hain. In designs ko <b>stub</b>, <b>totally stubby</b> aur <b>NSSA</b> areas kehte hain. Yeh CCNA exam ka hissa nahi hain; inse CCNP ENARSI mein milte ho. Bas maksad yaad rakho: chhote areas mein aur bhi chhote LSDB.</p>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ASBR par <code>default-information originate</code> type 5 default flood karta hai; iske liye pehle se default chahiye, jab tak <code>always</code> na ho.</li>
<li>External routes default mein E2 aate hain; <code>metric-type 1</code> unhe E1 banata hai.</li>
<li>E2 har router par ASBR ka metric rakhta hai; E1 internal cost jodta hai, isliye kai exits ke liye suit karta hai.</li>
<li>Type 5 route use karne ke liye router ko ASBR ka address (ABR ka type 4) chahiye.</li>
</ul></div>
`}};export{e as default};