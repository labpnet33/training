var e=`<svg viewBox="0 0 640 250" role="img" aria-label="DNS inside a VPC: the Route 53 Resolver answers from private hosted zones, public DNS or forwards to on-premises DNS">
<defs><marker id="r6" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#64748b"/></marker></defs>
<rect x="10" y="90" width="120" height="70" rx="10" fill="#bbf7d0" stroke="#64748b"/><text x="70" y="118" text-anchor="middle" class="svg-ink" font-size="13">web-1</text><text x="70" y="136" text-anchor="middle" class="svg-muted" font-size="11">asks for a name</text>
<rect x="190" y="80" width="170" height="90" rx="10" fill="#ddd6fe" stroke="#64748b"/><text x="275" y="106" text-anchor="middle" class="svg-ink" font-size="13">VPC resolver</text><text x="275" y="126" text-anchor="middle" class="svg-muted" font-size="11">10.91.0.2 (VPC base + 2)</text><text x="275" y="144" text-anchor="middle" class="svg-muted" font-size="11">also 169.254.169.253</text>
<rect x="430" y="10" width="200" height="56" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="530" y="34" text-anchor="middle" class="svg-ink" font-size="12">Private hosted zone</text><text x="530" y="52" text-anchor="middle" class="svg-muted" font-size="11">app.internal.example</text>
<rect x="430" y="96" width="200" height="56" rx="8" fill="#fde68a" stroke="#64748b"/><text x="530" y="120" text-anchor="middle" class="svg-ink" font-size="12">Public DNS</text><text x="530" y="138" text-anchor="middle" class="svg-muted" font-size="11">names on the internet</text>
<rect x="430" y="182" width="200" height="56" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="530" y="206" text-anchor="middle" class="svg-ink" font-size="12">Outbound endpoint + rule</text><text x="530" y="224" text-anchor="middle" class="svg-muted" font-size="11">corp.example to on-prem DNS</text>
<g stroke="#64748b" stroke-width="2" marker-end="url(#r6)"><line x1="130" y1="125" x2="188" y2="125"/><line x1="360" y1="105" x2="428" y2="45"/><line x1="360" y1="125" x2="428" y2="125"/><line x1="360" y1="148" x2="428" y2="205"/></g>
</svg>`,t={id:`dns`,h:{en:`DNS inside a VPC: when the name is the problem`,hi:`VPC ke andar DNS: jab naam hi problem ho`},body:{en:`
<p>DNS is the phone book of the network. If the book is missing, wrong, or you are calling the wrong directory service, you never get to dial. Many "network outages" are really phone-book problems: the server was up, the route was fine, and the name pointed to an old address. Rung 1 of the ladder exists because DNS fails in a way that looks like everything else failing.</p>

<h3>How DNS works inside a VPC</h3>
<p>Every VPC has an Amazon-provided DNS service called the <b>Route 53 Resolver</b>. Instances reach it at the address <b>VPC base plus two</b> (for 10.91.0.0/16 that is <code>10.91.0.2</code>) and at the fixed link-local address <code>169.254.169.253</code>. The resolver answers:</p>
<ul>
<li>names of <b>private hosted zones</b> associated with the VPC (for example <code>app.internal.example</code>);</li>
<li>AWS-provided private DNS names for instances (such as <code>ip-10-91-2-20.ap-south-1.compute.internal</code>);</li>
<li>public internet names, by recursion;</li>
<li>names that match a <b>forwarding rule</b>, sent to another DNS server such as your on-premises one.</li>
</ul>

<div class="dia">`+e+`<p class="cap">Where a name can be answered from. The resolver is the single decision point for instances.</p></div>

<h3>Two VPC settings that must be on</h3>
<table class="cmp"><tr><th>Attribute</th><th>Meaning</th><th>Check</th></tr>
<tr><td><code>enableDnsSupport</code></td><td>The VPC resolver (base + 2) works at all</td><td>Usually true by default</td></tr>
<tr><td><code>enableDnsHostnames</code></td><td>Instances get DNS names; required for private hosted zone association and for public DNS names of instances</td><td>Often <b>false</b> for VPCs created with the CLI; check it</td></tr></table>
<pre class="code">aws ec2 describe-vpc-attribute --vpc-id $VPC --attribute enableDnsSupport
aws ec2 describe-vpc-attribute --vpc-id $VPC --attribute enableDnsHostnames
aws ec2 modify-vpc-attribute --vpc-id $VPC --enable-dns-hostnames</pre>
<p>A private hosted zone only answers queries from VPCs it is <b>associated</b> with. A second VPC (even peered, or behind a Transit Gateway) does not see the zone until you associate it:</p>
<pre class="code">aws route53 associate-vpc-with-hosted-zone --hosted-zone-id $ZONE --vpc VPCRegion=ap-south-1,VPCId=$OTHER_VPC</pre>
<p>Cross-account association needs an authorisation created in the zone's account first.</p>

<h3>Hybrid DNS: endpoints and rules</h3>
<ul>
<li><b>Outbound endpoint + forwarding rule</b>: VPC instances ask for <code>corp.example</code>; the rule sends the query to on-premises DNS servers through ENIs in your subnets.</li>
<li><b>Inbound endpoint</b>: on-premises machines send queries for VPC private names to ENIs in your VPC, which hand them to the resolver.</li>
</ul>
<p>Resolver endpoints are ENIs and bill per hour each, plus per query; check the current Amazon Route 53 pricing page. They also need security groups that allow DNS (UDP and TCP 53), and the on-premises side needs routes over VPN or Direct Connect.</p>

<h3>Testing from an instance</h3>
<pre class="code">dig app.internal.example +short
dig app.internal.example @10.91.0.2
nslookup app.internal.example
<span class="c"># does it connect once resolved?</span>
curl -m 5 -v app.internal.example:8080</pre>
<p><b>Illustrative output</b> of a healthy and a failing lookup:</p>
<pre class="out">$ dig app.internal.example +short
<span class="hl">10.91.2.20</span>
$ dig app.old.internal.example
;; -&gt;&gt;HEADER&lt;&lt;- opcode: QUERY, status: <span class="hl">NXDOMAIN</span>, id: 4821</pre>
<p>The words matter: <b>NXDOMAIN</b> means the resolver answered "this name does not exist"; <b>SERVFAIL</b> means the resolver could not get an answer; a <b>timeout</b> means the resolver was not reached.</p>

<h3>Common DNS causes</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th></tr>
<tr><td>NXDOMAIN for an internal name</td><td>Private hosted zone not associated with this VPC, record missing, or wrong zone</td></tr>
<tr><td>Works in VPC A, fails in VPC B over a TGW</td><td>The zone is associated only with VPC A</td></tr>
<tr><td>Resolves to a public IP from inside the VPC</td><td>Split-horizon: the private zone is not applied, or <code>enableDnsHostnames</code> is off</td></tr>
<tr><td>Intermittent timeouts under load</td><td>A per-interface limit on queries to the VPC resolver (documented at 1,024 packets per second per interface at the time of writing; confirm in the docs)</td></tr>
<tr><td>Resolves to an old address</td><td>Cached answer or stale record; check TTL</td></tr>
<tr><td>Custom DNS server unreachable</td><td>A DHCP options set points instances at a DNS server they cannot reach</td></tr></table>

<div class="eg"><p><b>Worked example.</b> web-1 cannot open <code>app.internal.example:8080</code>. <code>dig</code> returns NXDOMAIN. Rungs 2 to 5 are irrelevant yet. You check the private hosted zone: it exists, with an A record to 10.91.2.20, but it is associated only with the old VPC. You associate noc-vpc with the zone. <code>dig</code> now returns 10.91.2.20, and the connection test moves on to the next rung. No security group was touched.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Testing connectivity with the IP when users use the name (or the reverse). Assuming flow logs will show DNS failures (resolver traffic is not logged). Forgetting that a name resolving says nothing about whether the port is reachable. Changing DHCP options and forgetting that instances only pick them up when they renew leases.</p></div>
<div class="exam"><p><b>Exam trap.</b> "A private hosted zone works in every VPC of the account." It only works for VPCs associated with it, and it needs <code>enableDnsSupport</code> and <code>enableDnsHostnames</code> on those VPCs.</p></div>

<div class="scn"><h4>The migration that moved the app but not the zone</h4><p>After a new "tools" VPC was connected through the Transit Gateway, engineers could ping the database IP from it but every script using the database name failed with NXDOMAIN. The private hosted zone was associated only with the production VPC. One association call later, names resolved from the tools VPC. Meanwhile an hour had been lost checking route tables that were perfectly fine.</p><p><b>Lesson:</b> when IPs work and names do not, it is DNS; start at rung 1.</p></div>

<div class="iv"><p class="q">"An instance can reach a server by IP but not by name. What do you check?"</p><p>Run dig against the VPC resolver and read the status. NXDOMAIN: the zone is not associated with this VPC or the record is missing. SERVFAIL or timeout: the resolver or a forwarding rule is broken. Check enableDnsSupport and enableDnsHostnames, DHCP options, and for hybrid names the resolver endpoint rules and security groups on port 53.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The VPC resolver lives at VPC base + 2 and 169.254.169.253.</li>
<li>Private hosted zones answer only for associated VPCs and need DNS support and DNS hostnames enabled.</li>
<li>Resolver endpoints and rules provide hybrid DNS; they are billed per ENI-hour.</li>
<li>NXDOMAIN, SERVFAIL and timeout mean different things.</li>
<li>Flow logs do not show resolver traffic; test with dig.</li>
</ul></div>
`,hi:`
<p>DNS network ki phone book hai. Book missing ho, galat ho, ya aap galat directory service ko call kar rahe ho, to dial karne tak aap pahunchte hi nahi. Kai "network outages" asal mein phone-book problems hoti hain: server up tha, route theek tha, aur naam purane address ko point karta tha. Ladder ki rung 1 isliye hai kyunki DNS aise fail hota hai ki sab kuch fail hone jaisa lagta hai.</p>

<h3>VPC ke andar DNS kaise kaam karta hai</h3>
<p>Har VPC mein Amazon-provided DNS service hoti hai jise <b>Route 53 Resolver</b> kehte hain. Instances use <b>VPC base plus two</b> address par (10.91.0.0/16 ke liye <code>10.91.0.2</code>) aur fixed link-local address <code>169.254.169.253</code> par pahunchte hain. Resolver in ke jawab deta hai:</p>
<ul>
<li>VPC se associated <b>private hosted zones</b> ke naam (jaise <code>app.internal.example</code>);</li>
<li>instances ke AWS-provided private DNS names (jaise <code>ip-10-91-2-20.ap-south-1.compute.internal</code>);</li>
<li>public internet names, recursion se;</li>
<li><b>forwarding rule</b> se match hone wale naam, jo doosre DNS server ko bheje jaate hain jaise aapka on-premises server.</li>
</ul>

<div class="dia">`+e+`<p class="cap">Naam kahan se answer ho sakta hai. Instances ke liye resolver akela decision point hai.</p></div>

<h3>Do VPC settings jo on honi chahiye</h3>
<table class="cmp"><tr><th>Attribute</th><th>Matlab</th><th>Check</th></tr>
<tr><td><code>enableDnsSupport</code></td><td>VPC resolver (base + 2) chalta hi hai</td><td>Aam taur par default true</td></tr>
<tr><td><code>enableDnsHostnames</code></td><td>Instances ko DNS names milte hain; private hosted zone association aur instances ke public DNS names ke liye zaroori</td><td>CLI se bane VPCs mein aksar <b>false</b>; check karo</td></tr></table>
<pre class="code">aws ec2 describe-vpc-attribute --vpc-id $VPC --attribute enableDnsSupport
aws ec2 describe-vpc-attribute --vpc-id $VPC --attribute enableDnsHostnames
aws ec2 modify-vpc-attribute --vpc-id $VPC --enable-dns-hostnames</pre>
<p>Private hosted zone sirf unhi VPCs ki queries ka jawab deta hai jo usse <b>associated</b> hain. Doosra VPC (peered ya Transit Gateway ke peeche bhi) zone tab tak nahi dekhta jab tak aap use associate na karo:</p>
<pre class="code">aws route53 associate-vpc-with-hosted-zone --hosted-zone-id $ZONE --vpc VPCRegion=ap-south-1,VPCId=$OTHER_VPC</pre>
<p>Cross-account association ke liye pehle zone ke account mein authorisation banana padta hai.</p>

<h3>Hybrid DNS: endpoints aur rules</h3>
<ul>
<li><b>Outbound endpoint + forwarding rule</b>: VPC instances <code>corp.example</code> poochte hain; rule query ko aapke subnets ke ENIs ke zariye on-premises DNS servers ko bhejti hai.</li>
<li><b>Inbound endpoint</b>: on-premises machines VPC private names ki queries aapke VPC ke ENIs ko bhejti hain, jo unhe resolver ko dete hain.</li>
</ul>
<p>Resolver endpoints ENIs hain aur har ek per hour plus per query bill hota hai; current Amazon Route 53 pricing page dekho. Unhe aise security groups chahiye jo DNS (UDP aur TCP 53) allow karein, aur on-premises side ko VPN ya Direct Connect par routes chahiye.</p>

<h3>Instance se test karna</h3>
<pre class="code">dig app.internal.example +short
dig app.internal.example @10.91.0.2
nslookup app.internal.example
<span class="c"># resolve hone ke baad connect hota hai?</span>
curl -m 5 -v app.internal.example:8080</pre>
<p>Healthy aur failing lookup ka <b>illustrative output</b>:</p>
<pre class="out">$ dig app.internal.example +short
<span class="hl">10.91.2.20</span>
$ dig app.old.internal.example
;; -&gt;&gt;HEADER&lt;&lt;- opcode: QUERY, status: <span class="hl">NXDOMAIN</span>, id: 4821</pre>
<p>Shabd matter karte hain: <b>NXDOMAIN</b> ka matlab resolver ne jawab diya "yeh naam exist nahi karta"; <b>SERVFAIL</b> ka matlab resolver ko jawab nahi mila; <b>timeout</b> ka matlab resolver tak pahunche hi nahi.</p>

<h3>Common DNS causes</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th></tr>
<tr><td>Internal naam ke liye NXDOMAIN</td><td>Private hosted zone is VPC se associated nahi, record missing, ya galat zone</td></tr>
<tr><td>VPC A mein chalta hai, TGW ke paar VPC B mein fail</td><td>Zone sirf VPC A se associated hai</td></tr>
<tr><td>VPC ke andar se public IP resolve hota hai</td><td>Split-horizon: private zone lagu nahi, ya <code>enableDnsHostnames</code> off</td></tr>
<tr><td>Load mein intermittent timeouts</td><td>VPC resolver ko queries par per-interface limit (likhte waqt documented 1,024 packets per second per interface; docs mein confirm karo)</td></tr>
<tr><td>Purane address par resolve hota hai</td><td>Cached answer ya stale record; TTL dekho</td></tr>
<tr><td>Custom DNS server unreachable</td><td>DHCP options set instances ko aise DNS server ki taraf point karta hai jo unhe nahi milta</td></tr></table>

<div class="eg"><p><b>Worked example.</b> web-1 <code>app.internal.example:8080</code> nahi khol pata. <code>dig</code> NXDOMAIN deta hai. Rungs 2 se 5 abhi irrelevant hain. Aap private hosted zone dekhte ho: woh exist karta hai, 10.91.2.20 ka A record ke saath, par sirf purane VPC se associated hai. Aap noc-vpc ko zone se associate karte ho. <code>dig</code> ab 10.91.2.20 deta hai, aur connection test agli rung par chalta hai. Kisi security group ko haath nahi lagaya.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Users naam use karte hain par aap IP se connectivity test karte ho (ya ulta). Yeh maanna ki flow logs DNS failures dikhayenge (resolver traffic log nahi hota). Yeh bhoolna ki naam resolve hona port reachable hone ke baare mein kuch nahi batata. DHCP options badalkar bhoolna ki instances unhe sirf lease renew karne par uthate hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Private hosted zone account ke har VPC mein chalta hai." Woh sirf associated VPCs mein chalta hai, aur un VPCs par <code>enableDnsSupport</code> aur <code>enableDnsHostnames</code> on chahiye.</p></div>

<div class="scn"><h4>Migration jisme app move hui par zone nahi</h4><p>Naya "tools" VPC Transit Gateway se judne ke baad engineers usse database IP ko ping kar paate the par database naam use karne wali har script NXDOMAIN se fail hoti thi. Private hosted zone sirf production VPC se associated tha. Ek association call ke baad tools VPC se naam resolve hone lage. Is beech ek ghanta un route tables ko check karne mein gaya jo bilkul theek thi.</p><p><b>Seekh:</b> jab IPs chalte hain aur names nahi, to woh DNS hai; rung 1 se shuru karo.</p></div>

<div class="iv"><p class="q">"Instance server tak IP se pahunchta hai par naam se nahi. Kya check karoge?"</p><p>VPC resolver ke against dig chalao aur status padho. NXDOMAIN: zone is VPC se associated nahi ya record missing. SERVFAIL ya timeout: resolver ya forwarding rule toota hai. enableDnsSupport aur enableDnsHostnames, DHCP options, aur hybrid names ke liye resolver endpoint rules aur port 53 ke security groups check karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VPC resolver VPC base + 2 aur 169.254.169.253 par rehta hai.</li>
<li>Private hosted zones sirf associated VPCs ke liye answer karte hain aur DNS support aur DNS hostnames enabled chahiye.</li>
<li>Resolver endpoints aur rules hybrid DNS dete hain; per ENI-hour bill hote hain.</li>
<li>NXDOMAIN, SERVFAIL aur timeout ke matlab alag hain.</li>
<li>Flow logs resolver traffic nahi dikhate; dig se test karo.</li>
</ul></div>
`}};export{t as default};