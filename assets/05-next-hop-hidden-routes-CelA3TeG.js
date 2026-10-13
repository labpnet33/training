var e={id:`bgp-next-hop-hidden`,h:{en:`Next hop, hidden routes and next-hop self`,hi:`Next hop, hidden routes aur next-hop self`},body:{en:`
<p>Imagine you get a delivery note that says "pick up at the ISP's warehouse, 100.66.1.1". You have no map of that street. You know the parcel exists, but you cannot go there. In BGP this happens often: a route is learned correctly, but the router cannot reach its next hop, so it keeps the route and does not use it. Junos marks such a route <b>hidden</b>. It is the most common cause of "BGP is Established but there is no Internet".</p>

<h3>How the next hop travels</h3>
<ul>
<li>EBGP changes the next hop to the advertiser's own address when it sends a route to another AS.</li>
<li>IBGP does <b>not</b> change the next hop. A route learned from the ISP is passed inside your AS still pointing to the ISP's address.</li>
<li>A router can use a BGP route only when it can <b>resolve</b> the protocol next hop in its routing table (usually through the IGP). If it cannot, the route is hidden: it is not active, not forwarded to and not advertised.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Unresolved next hop">
<rect x="20" y="70" width="90" height="50" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="65" y="100" text-anchor="middle" class="svg-ink" font-size="12">ISP</text>
<rect x="190" y="70" width="90" height="50" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="235" y="100" text-anchor="middle" class="svg-ink" font-size="12">R1 edge</text>
<rect x="360" y="70" width="90" height="50" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="405" y="100" text-anchor="middle" class="svg-ink" font-size="12">R3 core</text>
<line x1="110" y1="95" x2="190" y2="95" stroke="#64748b" stroke-width="2"/><line x1="280" y1="95" x2="360" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="150" y="85" text-anchor="middle" class="svg-accent" font-size="11">EBGP</text><text x="320" y="85" text-anchor="middle" class="svg-accent" font-size="11">IBGP</text>
<text x="500" y="75" class="svg-muted" font-size="12">Next hop 100.66.1.1</text>
<text x="500" y="95" class="svg-muted" font-size="12">not in R3 table</text>
<text x="500" y="115" class="svg-ink" font-size="12">route is hidden</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Fix: next-hop self on R1, or put the ISP link into the IGP</text>
</svg><p class="cap">Unresolved next hop: the route exists but cannot be used.</p></div>

<h3>The Indore case: what the symptom looks like</h3>
<p>Indore Textiles (AS 65020) runs IBGP between R1, R2 and R3. After a security change the ISP link was removed from OSPF. Every BGP session stays Established, yet the branch behind R3 lost the Internet. On R3:</p>
<pre class="out">lab@IDR-R3&gt; show bgp summary
Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
10.30.255.1           65020          5          5       0       0        1:05 Establ
  inet.0: <span class="hl">0/2/2/0</span>
10.30.255.2           65020          4          5       0       0        1:05 Establ
  inet.0: 0/0/0/0
lab@IDR-R3&gt; show route 203.0.113.0/24
inet.0: 13 destinations, 13 routes (11 active, 0 holddown, <span class="hl">2 hidden</span>)</pre>
<p>Read the first line of each peer: 0 active, 2 received, 2 accepted. The routes arrived and passed policy, but none is active. <code>show route</code> prints nothing, and the header counts 2 hidden. Now look at the hidden routes in detail:</p>
<pre class="out">lab@IDR-R3&gt; show route hidden detail
203.0.113.0/24 (1 entry, 0 announced)
         BGP    Preference: 170/-101
                Next hop type: Unusable
                Source: 10.30.255.1
                Protocol next hop: 100.66.1.1 (<span class="hl">unresolved</span>)
                State: &lt;Hidden Int Ext&gt;
                Inactive reason: Unusable path
                AS path: 64510 I
lab@IDR-R3&gt; show route receive-protocol bgp 10.30.255.1 hidden
  Prefix                  Nexthop              MED     Lclpref    AS path
  198.51.100.0/24         100.66.1.1                   100        64510 I
  203.0.113.0/24          100.66.1.1                   100        64510 I</pre>
<p>The clues are <b>Hidden</b>, <b>Unusable path</b> and <b>(unresolved)</b>. The protocol next hop 100.66.1.1 is the ISP's address, and R3 has no route to it, because the ISP link is not in OSPF. The BGP session itself is fine, because it runs between loopbacks.</p>

<h3>The fix: next-hop self</h3>
<p>The security team insists that the ISP link stays out of the IGP, so we change the next hop at the edge. R1 gets an export policy towards the IBGP group that sets next-hop self. The term has no <code>accept</code>: after the action the route continues to the default BGP export rules, which already advertise active BGP routes.</p>
<pre class="code">set policy-options policy-statement NHS term 1 from protocol bgp
set policy-options policy-statement NHS term 1 then next-hop self
set protocols bgp group IBGP export NHS</pre>
<pre class="out">lab@IDR-R1&gt; show route advertising-protocol bgp 10.30.255.3
  Prefix                  Nexthop              MED     Lclpref    AS path
* 198.51.100.0/24         <span class="hl">Self</span>                         100        64510 I
* 203.0.113.0/24          Self                         100        64510 I
lab@IDR-R3&gt; show route 203.0.113.0/24 detail
        *BGP    Preference: 170/-101
                Next hop: 10.30.13.1 via ge-0/0/2.0, selected
                Protocol next hop: 10.30.255.1
                State: &lt;Active Int Ext&gt;
                Metric2: 1
lab@IDR-R3&gt; show route hidden
inet.0: 13 destinations, 13 routes (13 active, 0 holddown, 0 hidden)</pre>
<p>Before the policy R1 advertised the ISP address as the next hop; after it R1 advertises <b>Self</b>. R3 now resolves the protocol next hop 10.30.255.1 (R1's loopback) through OSPF, the route is active and the hidden count is 0. R2 still has no route to 100.66.1.0/30 (the security requirement), and PC3 can ping the ISP test address 203.0.113.1.</p>
<p>The other fix, advertising the ISP link into the IGP as a passive interface, also works and is common. Next-hop self keeps the ISP subnet out of the IGP and makes the BGP routes depend only on the loopback of the edge router.</p>

<div class="eg"><p><b>Worked example.</b> A router shows "inet.0: 0/2/2/0" for an IBGP peer and an empty <code>show route</code> for the prefix. Step 1: <code>show route hidden detail</code> and read the Protocol next hop. Step 2: <code>show route &lt;that next hop&gt;</code>. If it returns nothing, the next hop is unreachable. Step 3: choose next-hop self on the advertiser or add the subnet to the IGP. Step 4: verify the hidden count is zero.</p></div>

<div class="warn"><p><b>Common mistake.</b> Searching for a BGP session problem when the session is Established. Hidden routes are not a session fault. Another one: applying next-hop self on the receiving router instead of the router that sends the route into IBGP; the export policy must be on the edge router.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Hidden" routes appear in the header of show route as "N hidden", and you see them with <code>show route hidden</code>. The Junos cause is an unresolved protocol next hop (or a policy reject with keep). The policy is applied as an export on the IBGP group of the edge router, not as an import.</p></div>

<div class="scn"><h4>Friday change, Monday outage</h4><p>A security review removed the ISP subnet from OSPF. Nothing broke on Friday evening because the old routes stayed in the table. When the BGP session flapped on Monday, the new routes were hidden on all core routers and the branches lost the Internet. The fix was a three-line next-hop self policy on the edge router.</p><p><b>Lesson:</b> a change that removes IGP reachability of a BGP next hop can look harmless until the next refresh.</p></div>

<div class="iv"><p class="q">"BGP is up but a router has no BGP routes in the table. What do you check?"</p><p>I check the summary for received but not active counts, then show route hidden detail. If the protocol next hop is unresolved, the router cannot reach the next hop. I fix it on the edge router with an export policy that sets next-hop self towards IBGP, or by putting the external link into the IGP, then confirm the hidden count is zero.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IBGP keeps the external next hop, so core routers must be able to resolve it.</li>
<li>Unresolved next hop gives hidden routes: received, accepted, not active.</li>
<li>Next-hop self as an export policy on the edge router is the common fix.</li>
<li>Use show route hidden detail and receive-protocol hidden to diagnose.</li>
</ul></div>
`,hi:`
<p>Socho aapko delivery note mili: "ISP ke warehouse se uthao, 100.66.1.1". Aapke paas us gali ka nakshaa nahi hai. Aap jaante ho parcel hai, par wahan ja nahi sakte. BGP mein ye aksar hota hai: route sahi seekha gaya, par router uska next hop reach nahi kar sakta, isliye route rakhta hai par use nahi karta. Junos aise route ko <b>hidden</b> mark karta hai. "BGP Established hai par Internet nahi" ka ye sabse aam karan hai.</p>

<h3>Next hop kaise safar karta hai</h3>
<ul>
<li>EBGP doosre AS ko route bhejte waqt next hop ko advertiser ke apne address par badal deta hai.</li>
<li>IBGP next hop ko <b>nahi</b> badalta. ISP se seekha route aapke AS ke andar bhi ISP ke address ki taraf point karta hua jaata hai.</li>
<li>Router BGP route tabhi use kar sakta hai jab wo protocol next hop ko routing table mein <b>resolve</b> kar sake (aam taur par IGP se). Na kar sake to route hidden hai: active nahi, forward nahi, advertise nahi.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Unresolved next hop">
<rect x="20" y="70" width="90" height="50" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="65" y="100" text-anchor="middle" class="svg-ink" font-size="12">ISP</text>
<rect x="190" y="70" width="90" height="50" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="235" y="100" text-anchor="middle" class="svg-ink" font-size="12">R1 edge</text>
<rect x="360" y="70" width="90" height="50" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="405" y="100" text-anchor="middle" class="svg-ink" font-size="12">R3 core</text>
<line x1="110" y1="95" x2="190" y2="95" stroke="#64748b" stroke-width="2"/><line x1="280" y1="95" x2="360" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="150" y="85" text-anchor="middle" class="svg-accent" font-size="11">EBGP</text><text x="320" y="85" text-anchor="middle" class="svg-accent" font-size="11">IBGP</text>
<text x="500" y="75" class="svg-muted" font-size="12">Next hop 100.66.1.1</text>
<text x="500" y="95" class="svg-muted" font-size="12">R3 table mein nahi</text>
<text x="500" y="115" class="svg-ink" font-size="12">route hidden hai</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Fix: R1 par next-hop self, ya ISP link ko IGP mein daalo</text>
</svg><p class="cap">Unresolved next hop: route hai par use nahi ho sakta.</p></div>

<h3>Indore case: symptom kaisa dikhta hai</h3>
<p>Indore Textiles (AS 65020) R1, R2 aur R3 ke beech IBGP chalata hai. Security change ke baad ISP link OSPF se hata diya gaya. Har BGP session Established hai, phir bhi R3 ke peeche branch ka Internet chala gaya. R3 par:</p>
<pre class="out">lab@IDR-R3&gt; show bgp summary
Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
10.30.255.1           65020          5          5       0       0        1:05 Establ
  inet.0: <span class="hl">0/2/2/0</span>
10.30.255.2           65020          4          5       0       0        1:05 Establ
  inet.0: 0/0/0/0
lab@IDR-R3&gt; show route 203.0.113.0/24
inet.0: 13 destinations, 13 routes (11 active, 0 holddown, <span class="hl">2 hidden</span>)</pre>
<p>Har peer ki pehli line padho: 0 active, 2 received, 2 accepted. Routes aaye aur policy paar ki, par koi active nahi. <code>show route</code> kuch print nahi karta, aur header 2 hidden ginta hai. Ab hidden routes ko detail mein dekho:</p>
<pre class="out">lab@IDR-R3&gt; show route hidden detail
203.0.113.0/24 (1 entry, 0 announced)
         BGP    Preference: 170/-101
                Next hop type: Unusable
                Source: 10.30.255.1
                Protocol next hop: 100.66.1.1 (<span class="hl">unresolved</span>)
                State: &lt;Hidden Int Ext&gt;
                Inactive reason: Unusable path
                AS path: 64510 I
lab@IDR-R3&gt; show route receive-protocol bgp 10.30.255.1 hidden
  Prefix                  Nexthop              MED     Lclpref    AS path
  198.51.100.0/24         100.66.1.1                   100        64510 I
  203.0.113.0/24          100.66.1.1                   100        64510 I</pre>
<p>Clues hain <b>Hidden</b>, <b>Unusable path</b> aur <b>(unresolved)</b>. Protocol next hop 100.66.1.1 ISP ka address hai, aur R3 ke paas uska route nahi, kyunki ISP link OSPF mein nahi. BGP session theek hai, kyunki wo loopbacks ke beech chalta hai.</p>

<h3>Fix: next-hop self</h3>
<p>Security team kehti hai ISP link IGP se bahar rahe, isliye hum edge par next hop badalte hain. R1 ko IBGP group ki taraf export policy milti hai jo next-hop self set karti hai. Term mein <code>accept</code> nahi: action ke baad route default BGP export rules par jaata hai, jo active BGP routes pehle se advertise karte hain.</p>
<pre class="code">set policy-options policy-statement NHS term 1 from protocol bgp
set policy-options policy-statement NHS term 1 then next-hop self
set protocols bgp group IBGP export NHS</pre>
<pre class="out">lab@IDR-R1&gt; show route advertising-protocol bgp 10.30.255.3
  Prefix                  Nexthop              MED     Lclpref    AS path
* 198.51.100.0/24         <span class="hl">Self</span>                         100        64510 I
* 203.0.113.0/24          Self                         100        64510 I
lab@IDR-R3&gt; show route 203.0.113.0/24 detail
        *BGP    Preference: 170/-101
                Next hop: 10.30.13.1 via ge-0/0/2.0, selected
                Protocol next hop: 10.30.255.1
                State: &lt;Active Int Ext&gt;
                Metric2: 1
lab@IDR-R3&gt; show route hidden
inet.0: 13 destinations, 13 routes (13 active, 0 holddown, 0 hidden)</pre>
<p>Policy se pehle R1 ISP address ko next hop ki tarah advertise karta tha; baad mein R1 <b>Self</b> advertise karta hai. R3 ab protocol next hop 10.30.255.1 (R1 ka loopback) ko OSPF se resolve karta hai, route active hai aur hidden count 0 hai. R2 ke paas 100.66.1.0/30 ka route ab bhi nahi (security requirement), aur PC3 ISP test address 203.0.113.1 ko ping kar sakta hai.</p>
<p>Doosra fix, ISP link ko passive interface ki tarah IGP mein advertise karna, bhi kaam karta hai aur aam hai. Next-hop self ISP subnet ko IGP se bahar rakhta hai aur BGP routes ko sirf edge router ke loopback par nirbhar banata hai.</p>

<div class="eg"><p><b>Worked example.</b> Router IBGP peer ke liye "inet.0: 0/2/2/0" dikhata hai aur prefix ke liye <code>show route</code> khaali hai. Step 1: <code>show route hidden detail</code> aur Protocol next hop padho. Step 2: <code>show route &lt;wo next hop&gt;</code>. Kuch na mile to next hop unreachable hai. Step 3: advertiser par next-hop self chuno ya subnet ko IGP mein daalo. Step 4: verify karo ki hidden count zero hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Session Established hone par bhi BGP session problem dhoondhna. Hidden routes session fault nahi hain. Ek aur: next-hop self ko receiving router par lagana, jabki policy us router par honi chahiye jo route ko IBGP mein bhejta hai; export policy edge router par chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Hidden" routes show route ke header mein "N hidden" ki tarah dikhte hain, aur <code>show route hidden</code> se dekhe jaate hain. Junos mein karan unresolved protocol next hop hai (ya keep ke saath policy reject). Policy edge router ke IBGP group par export ki tarah lagti hai, import ki tarah nahi.</p></div>

<div class="scn"><h4>Friday change, Monday outage</h4><p>Security review ne ISP subnet ko OSPF se hata diya. Friday shaam kuch nahi toota kyunki purane routes table mein the. Monday ko BGP session flap hua to saare core routers par naye routes hidden ho gaye aur branches ka Internet chala gaya. Fix edge router par teen line ki next-hop self policy thi.</p><p><b>Lesson:</b> BGP next hop ki IGP reachability hatane wala change agle refresh tak nirdosh lag sakta hai.</p></div>

<div class="iv"><p class="q">"BGP up hai par router ki table mein BGP routes nahi. Kya check karte ho?"</p><p>Main summary mein received par not active counts dekhta hoon, phir show route hidden detail. Protocol next hop unresolved ho to router next hop tak nahi pahunch sakta. Main edge router par IBGP ki taraf next-hop self set karne wali export policy se, ya external link ko IGP mein daalkar fix karta hoon, phir confirm karta hoon ki hidden count zero hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IBGP external next hop rakhta hai, isliye core routers ko use resolve kar paana chahiye.</li>
<li>Unresolved next hop hidden routes deta hai: received, accepted, active nahi.</li>
<li>Edge router par export policy ke roop mein next-hop self aam fix hai.</li>
<li>Diagnose ke liye show route hidden detail aur receive-protocol hidden use karo.</li>
</ul></div>
`}};export{e as default};