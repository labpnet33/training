var e=e=>`<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Konkan Carrier lab topology"><rect x="170" y="20" width="300" height="130" rx="14" fill="#e2e8f0"/><text x="320" y="40" text-anchor="middle" class="svg-muted" font-size="12">AS 65000 Konkan Carrier (IS-IS L2 + iBGP)</text><rect x="190" y="70" width="70" height="46" rx="8" fill="#bae6fd"/><text x="225" y="98" text-anchor="middle" class="svg-ink" font-size="14">PE1</text><rect x="285" y="70" width="70" height="46" rx="8" fill="#ddd6fe"/><text x="320" y="98" text-anchor="middle" class="svg-ink" font-size="14">RR</text><rect x="380" y="70" width="70" height="46" rx="8" fill="#bae6fd"/><text x="415" y="98" text-anchor="middle" class="svg-ink" font-size="14">PE2</text><line x1="260" y1="93" x2="285" y2="93" stroke="#64748b" stroke-width="2"/><line x1="355" y1="93" x2="380" y2="93" stroke="#64748b" stroke-width="2"/><rect x="20" y="70" width="80" height="46" rx="8" fill="#fde68a"/><text x="60" y="98" text-anchor="middle" class="svg-ink" font-size="14">CE1</text><rect x="540" y="70" width="80" height="46" rx="8" fill="#fde68a"/><text x="580" y="98" text-anchor="middle" class="svg-ink" font-size="14">CE2</text><line x1="100" y1="93" x2="190" y2="93" stroke="#64748b" stroke-width="2"/><line x1="450" y1="93" x2="540" y2="93" stroke="#64748b" stroke-width="2"/><text x="145" y="86" text-anchor="middle" class="svg-accent" font-size="12">eBGP</text><text x="495" y="86" text-anchor="middle" class="svg-accent" font-size="12">eBGP</text><text x="60" y="140" text-anchor="middle" class="svg-muted" font-size="12">AS 65101</text><text x="580" y="140" text-anchor="middle" class="svg-muted" font-size="12">AS 65102</text><text x="60" y="190" text-anchor="middle" class="svg-muted" font-size="12">172.16.1.0/24</text><text x="580" y="190" text-anchor="middle" class="svg-muted" font-size="12">172.16.2.0/24</text><text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">iBGP PE1-RR and RR-PE2 between loopbacks</text><text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">10.20.255.1 / .2 / .3</text></svg><p class="cap">`+e+`</p></div>`,t={id:`sp-core-big-picture`,h:{en:`The SP core and the BGP-free core idea: what you will learn`,hi:`SP core aur BGP-free core ka idea: kya seekhoge`},body:{en:`
<p><b>What you will learn in this module.</b> You will build and troubleshoot the BGP design that almost every service provider (SP) core uses: iBGP sessions between loopbacks, route reflectors instead of a full mesh, next-hop-self at the edge, and the best-path decision that ties it all to the IS-IS metric. This maps to the SPCOR 350-501 core-routing objectives on BGP in the SP network. By the end you can configure the design from scratch, read <code>show ip bgp</code> like a story, and fix a broken reflector in a ticket.</p>
<p><b>Prerequisites.</b> You should know eBGP basics (neighbor, remote-as, network), what an IGP is, and how IS-IS builds a table of loopbacks. If those are shaky, revisit the ENARSI and ENCOR BGP modules first. We go deeper here and do not repeat their basics.</p>

<h3>Analogy: a postal sorting hub</h3>
<p>Think of a national postal service. Local post offices (the <b>PE</b> routers) collect letters from customers. A letter carries a street address that only matters at the far end. In between, trucks only need to know which <i>sorting hub</i> to head for. The trucks and roads are the <b>IGP</b>: it knows only the hubs and the roads. The customer addresses live in a separate <b>directory</b>, <b>BGP</b>, that only the post offices need to read. Now imagine every post office keeps a private phone line to every other post office to update the directory. With 5 offices that is fine; with 500 it is chaos. So the service creates one <b>directory desk</b> (the <b>route reflector</b>) that every office calls, and the desk repeats updates to everyone. That is the whole module in one paragraph.</p>

@@D@@

<h3>Why a service provider core runs two protocols</h3>
<ul>
<li><b>IS-IS (the IGP)</b> carries only infrastructure: router loopbacks and core link subnets. A few hundred routes, fast convergence, stable.</li>
<li><b>BGP</b> carries the customer and Internet routes: possibly hundreds of thousands of prefixes. It is policy-rich but slow-moving by design.</li>
<li>Separating them means a flapping customer route never makes the IGP recalculate, and the IGP reaches the BGP next hops that BGP needs.</li>
<li>On a <b>BGP-free core</b> the middle routers (P routers) hold no customer routes at all. They forward on labels (next two modules). In this lab the RR is in the forwarding path, so it still sees routes, but the principle is the same: only the edges need the full BGP view.</li>
</ul>

<h3>The lab you will use</h3>
<p>Konkan Carrier (AS 65000) has three core routers: <b>PE1</b> (loopback 10.20.255.1), <b>RR</b> (10.20.255.2) and <b>PE2</b> (10.20.255.3). Links are 10.20.1.0/24 (PE1 to RR) and 10.20.2.0/24 (RR to PE2). IS-IS level 2 runs on all of them. Customer CE1 (AS 65101, 192.0.2.2, LAN 172.16.1.0/24) peers eBGP with PE1 at 192.0.2.1; CE2 (AS 65102, 198.51.100.2, LAN 172.16.2.0/24) peers with PE2 at 198.51.100.1. Your task: make the two LANs reach each other through the SP.</p>

<div class="eg"><p><b>Worked example: what exists before you configure iBGP.</b> The eBGP sessions work, and each PE already has its customer's route. The core has no BGP at all between PE1, RR and PE2:</p>
<pre class="out">PE1# show ip bgp
     Network          Next Hop            Metric LocPrf Weight Path
 *&gt;  172.16.1.0/24    192.0.2.2                0             0 65101 i

RR# show ip bgp summary
BGP router identifier 10.20.255.2, local AS number 65000
BGP table version is 1, main routing table version 1</pre>
<p>PE1 knows only its own customer. The RR has no neighbours yet. PE2 cannot reach 172.16.1.0/24 because nobody has told it. Your job is to carry the route across the core.</p></div>

<h3>The three decisions you will make in this module</h3>
<ol>
<li><b>How do the PEs talk?</b> iBGP between loopbacks, with update-source (chapter 2).</li>
<li><b>Who repeats routes?</b> A route reflector instead of a full mesh (chapters 3 and 4).</li>
<li><b>What does the next hop say?</b> next-hop-self so that remote PEs can resolve it through IS-IS (chapter 2), and how best path uses the IGP metric (chapter 5).</li>
</ol>

<div class="warn"><p><b>Common mistake.</b> Treating BGP as a replacement for the IGP. iBGP does not discover neighbours or build paths; it needs an IGP underneath so that the loopbacks and next hops are reachable. If IS-IS is broken, iBGP breaks with it.</p></div>
<div class="exam"><p><b>Exam trap.</b> iBGP does <i>not</i> prepend its own AS and does not change the next hop. Many questions are built around that single fact.</p></div>

<div class="scn"><h4>The directory that never reached the far office</h4><p>A new regional carrier turned up eBGP to a customer and could see the customer prefix on PE1, but PE2 in another city saw nothing. The IGP was healthy and the loopbacks pinged. The missing piece was simply the iBGP session across the core: nobody had configured it, so the route never left PE1.</p><p><b>Lesson:</b> eBGP learns the route; iBGP carries it across the provider. Always check that every PE has an iBGP path to every other PE, directly or via an RR.</p></div>

<div class="iv"><p class="q">"Why does a service provider run both an IGP and BGP in the core?"</p><p>The IGP carries infrastructure routes (loopbacks and links) and provides fast, stable reachability to BGP next hops. BGP carries the large and policy-driven set of customer and Internet routes. Keeping them apart protects the IGP from customer churn and lets P routers stay BGP-free when MPLS is used. Mention that iBGP depends on the IGP for next-hop resolution.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IS-IS carries loopbacks and links; BGP carries customer routes.</li>
<li>eBGP learns the customer route; iBGP carries it between PEs.</li>
<li>A route reflector replaces the full mesh as the network grows.</li>
<li>iBGP needs the IGP for next-hop reachability.</li>
<li>Lab devices: PE1, RR, PE2, CE1, CE2 with loopbacks 10.20.255.1 to .3.</li>
</ul></div>
`.replace(`@@D@@`,e(`The Konkan Carrier lab: three core routers in AS 65000 and two customers.`)),hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap woh BGP design banaoge aur troubleshoot karoge jo lagbhag har service provider (SP) core use karta hai: loopbacks ke beech iBGP sessions, full mesh ki jagah route reflectors, edge par next-hop-self, aur woh best-path decision jo sab kuch IS-IS metric se jodta hai. Yeh SPCOR 350-501 ke SP network mein BGP wale core-routing objectives se match karta hai. Ant tak aap design ko zero se configure kar paoge, <code>show ip bgp</code> ko kahani ki tarah padh paoge, aur ticket mein toota hua reflector theek kar paoge.</p>
<p><b>Prerequisites.</b> Aapko eBGP basics (neighbor, remote-as, network), IGP kya hota hai, aur IS-IS loopbacks ki table kaise banata hai, yeh pata hona chahiye. Agar yeh kamzor hain to pehle ENARSI aur ENCOR ke BGP modules dekho. Yahan hum aur gehraai mein jaate hain aur unke basics repeat nahi karte.</p>

<h3>Analogy: ek postal sorting hub</h3>
<p>Ek national postal service socho. Local post offices (<b>PE</b> routers) customers se letters lete hain. Letter par street address hota hai jo sirf door ke end par kaam aata hai. Beech mein trucks ko bas yeh jaanna hota hai ki kis <i>sorting hub</i> ki taraf jaana hai. Trucks aur roads <b>IGP</b> hain: woh sirf hubs aur roads jaanta hai. Customer addresses ek alag <b>directory</b>, <b>BGP</b>, mein rehte hain, jo sirf post offices ko padhni hoti hai. Ab socho har post office directory update karne ke liye har doosre post office se private phone line rakhta hai. 5 offices ke saath theek hai; 500 ke saath chaos. Isliye service ek <b>directory desk</b> (<b>route reflector</b>) banati hai jise har office call karta hai, aur desk updates sabko repeat karti hai. Poora module is ek paragraph mein hai.</p>

@@D@@

<h3>Service provider core do protocols kyun chalata hai</h3>
<ul>
<li><b>IS-IS (IGP)</b> sirf infrastructure le jaata hai: router loopbacks aur core link subnets. Kuch sau routes, fast convergence, stable.</li>
<li><b>BGP</b> customer aur Internet routes le jaata hai: ho sakta hai lakhon prefixes. Policy-rich hai lekin design se dheere chalta hai.</li>
<li>Dono ko alag rakhne se flapping customer route kabhi IGP ko recalculate nahi karwata, aur IGP un BGP next hops tak pahunchta hai jinki BGP ko zaroorat hai.</li>
<li><b>BGP-free core</b> mein beech ke routers (P routers) ke paas koi customer route nahi hota. Woh labels par forward karte hain (agle do modules). Is lab mein RR forwarding path mein hai, isliye woh routes dekhta hai, lekin principle wahi hai: sirf edges ko poora BGP view chahiye.</li>
</ul>

<h3>Jo lab aap use karoge</h3>
<p>Konkan Carrier (AS 65000) ke teen core routers hain: <b>PE1</b> (loopback 10.20.255.1), <b>RR</b> (10.20.255.2) aur <b>PE2</b> (10.20.255.3). Links 10.20.1.0/24 (PE1 se RR) aur 10.20.2.0/24 (RR se PE2) hain. Teeno par IS-IS level 2 chalta hai. Customer CE1 (AS 65101, 192.0.2.2, LAN 172.16.1.0/24) PE1 se 192.0.2.1 par eBGP peer karta hai; CE2 (AS 65102, 198.51.100.2, LAN 172.16.2.0/24) PE2 se 198.51.100.1 par peer karta hai. Aapka task: dono LANs ko SP ke through ek doosre tak pahunchana.</p>

<div class="eg"><p><b>Worked example: iBGP configure karne se pehle kya hota hai.</b> eBGP sessions chalte hain, aur har PE ke paas apne customer ka route hai. Core mein PE1, RR aur PE2 ke beech BGP bilkul nahi hai:</p>
<pre class="out">PE1# show ip bgp
     Network          Next Hop            Metric LocPrf Weight Path
 *&gt;  172.16.1.0/24    192.0.2.2                0             0 65101 i

RR# show ip bgp summary
BGP router identifier 10.20.255.2, local AS number 65000
BGP table version is 1, main routing table version 1</pre>
<p>PE1 sirf apna customer jaanta hai. RR ke koi neighbours nahi. PE2 172.16.1.0/24 tak nahi pahunch sakta kyunki kisi ne use bataya nahi. Aapka kaam route ko core ke paar le jaana hai.</p></div>

<h3>Is module mein aap teen decisions loge</h3>
<ol>
<li><b>PEs baat kaise karein?</b> Loopbacks ke beech iBGP, update-source ke saath (chapter 2).</li>
<li><b>Routes kaun repeat kare?</b> Full mesh ki jagah route reflector (chapters 3 aur 4).</li>
<li><b>Next hop kya kehta hai?</b> next-hop-self taaki remote PEs use IS-IS se resolve kar sakein (chapter 2), aur best path IGP metric kaise use karta hai (chapter 5).</li>
</ol>

<div class="warn"><p><b>Common mistake.</b> BGP ko IGP ka replacement samajhna. iBGP neighbours discover nahi karta aur paths nahi banata; use neeche IGP chahiye taaki loopbacks aur next hops reachable hon. IS-IS toota to iBGP bhi toot jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> iBGP apna AS prepend <i>nahi</i> karta aur next hop <i>nahi</i> badalta. Kai questions isi ek fact par bane hote hain.</p></div>

<div class="scn"><h4>Woh directory jo door wale office tak nahi pahunchi</h4><p>Ek naye regional carrier ne customer ke saath eBGP up kiya aur PE1 par customer prefix dikh gaya, par doosre shehar ke PE2 ko kuch nahi dikha. IGP healthy tha aur loopbacks ping ho rahe the. Kami bas core ke paar iBGP session ki thi: kisi ne configure hi nahi kiya tha, isliye route PE1 se bahar gaya hi nahi.</p><p><b>Lesson:</b> eBGP route seekhta hai; iBGP use provider ke paar le jaata hai. Hamesha check karo ki har PE ke paas har doosre PE tak iBGP path hai, seedha ya RR ke through.</p></div>

<div class="iv"><p class="q">"Service provider core mein IGP aur BGP dono kyun chalte hain?"</p><p>IGP infrastructure routes (loopbacks aur links) le jaata hai aur BGP next hops tak fast, stable reachability deta hai. BGP bade aur policy-driven customer aur Internet routes le jaata hai. Dono ko alag rakhne se IGP customer churn se bachta hai aur MPLS ke saath P routers BGP-free reh sakte hain. Zikr karo ki iBGP next-hop resolution ke liye IGP par depend karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IS-IS loopbacks aur links le jaata hai; BGP customer routes.</li>
<li>eBGP customer route seekhta hai; iBGP use PEs ke beech le jaata hai.</li>
<li>Network badhne par route reflector full mesh ki jagah leta hai.</li>
<li>iBGP ko next-hop reachability ke liye IGP chahiye.</li>
<li>Lab devices: PE1, RR, PE2, CE1, CE2, loopbacks 10.20.255.1 se .3.</li>
</ul></div>
`.replace(`@@D@@`,e(`Konkan Carrier lab: AS 65000 mein teen core routers aur do customers.`))}};export{t as default};