var e=(e,t)=>e.replace(/\{\{(\w+)\}\}/g,(e,n)=>t[n]),t=`<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="{{aria}}">
<text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">{{title}}</text>
<rect x="20" y="40" width="600" height="34" rx="6" fill="#e2e8f0"/><rect x="20" y="40" width="150" height="34" rx="6" fill="#bbf7d0"/><text x="95" y="62" text-anchor="middle" class="svg-ink" font-size="12">{{r1}}</text>
<rect x="20" y="90" width="600" height="34" rx="6" fill="#e2e8f0"/><rect x="20" y="90" width="420" height="34" rx="6" fill="#fde68a"/><text x="230" y="112" text-anchor="middle" class="svg-ink" font-size="12">{{r2}}</text>
<rect x="20" y="140" width="600" height="34" rx="6" fill="#fecaca"/><text x="320" y="162" text-anchor="middle" class="svg-ink" font-size="12">{{r3}}</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">{{n1}}</text><text x="320" y="220" text-anchor="middle" class="svg-muted" font-size="12">{{n2}}</text>
</svg><p class="cap">{{cap}}</p></div>`,n=e(t,{aria:`SNAT port usage levels`,title:`SNAT ports in use on one public IP (about 64,512 total)`,r1:`Healthy: 10 percent used`,r2:`Warning: 70 percent, watch it`,r3:`Exhausted: new connections dropped or time out`,n1:`Existing connections keep working; only NEW outbound connections fail.`,n2:`The symptom is intermittent: some calls work, some time out.`,cap:`SNAT exhaustion is a capacity problem: all ports of all public IPs are in use, so a new outbound connection has no port to be translated to.`}),r=e(t,{aria:`SNAT port usage levels`,title:`Ek public IP par use mein SNAT ports (kul lagbhag 64,512)`,r1:`Healthy: 10 percent use`,r2:`Warning: 70 percent, nazar rakho`,r3:`Exhausted: naye connections drop ya timeout`,n1:`Maujooda connections chalte rehte hain; sirf NAYE outbound connections fail hote hain.`,n2:`Symptom intermittent hai: kuch calls chalti hain, kuch timeout.`,cap:`SNAT exhaustion capacity problem hai: saare public IPs ke saare ports use mein hain, isliye naye outbound connection ke liye translate karne ko port nahi bacha.`}),i={id:`snat-exhaustion`,h:{en:`SNAT ports and exhaustion`,hi:`SNAT ports aur exhaustion`},body:{en:`
<h3>Ports are the scarce resource</h3>
<p>A TCP or UDP connection is identified by five values: protocol, source IP, source port, destination IP, destination port. When 200 VMs share one public IP, the NAT device must give each outbound connection a unique <b>source port</b> on that IP so it can tell replies apart. A public IP has about 64,512 usable ports (verify), so the budget is finite. But the rule is subtle: a port can be <b>reused for a different destination</b>. A pair such as 203.0.113.50:1024 can talk to server A and, at the same time, to server B on a different IP or port. Problems appear when many connections go to the <b>same destination IP and port</b>, for example one busy payment API on 198.51.100.30:443.</p>

<h3>How exhaustion looks</h3>
`+n+`
<ul>
<li>Intermittent timeouts or connection resets to external services, often under load or after a deploy that opens many connections.</li>
<li>Errors such as "cannot assign requested address" from an application or a retry storm in logs.</li>
<li>The VM is healthy, CPU is fine, DNS resolves, and a single manual curl works. Only bursts fail.</li>
<li>A graph of dropped packets or failed connections on the NAT Gateway or load balancer rising with traffic.</li>
</ul>

<h3>Why it happens</h3>
<ul>
<li><b>No connection reuse.</b> Code opens a new HTTPS connection per request instead of keeping connections alive and pooling them.</li>
<li><b>Long idle timeouts.</b> Ports are held for minutes after the last packet.</li>
<li><b>Hot destination.</b> Thousands of flows to one IP and port.</li>
<li><b>Too few public IPs</b> for the number of VMs or for the traffic.</li>
<li><b>Fixed per-VM allocation on a load balancer.</b> With default allocation a backend pool gets a table of ports per instance that gets smaller as the pool grows. As an illustration (verify the exact table): a pool of up to 50 VMs gets 1,024 ports each, 51 to 100 VMs gets 512 each, and so on. One VM then cannot use more than its share even when others are idle.</li>
</ul>

<div class="eg"><b>Worked example.</b> A Standard Load Balancer has one outbound frontend IP, giving about 64,000 ports. The pool has 60 VMs, so each VM is allocated 512 ports (illustrative). A batch job on one VM opens 700 parallel connections to 198.51.100.30:443. The 513th connection has no port: it fails. Meanwhile 59 other VMs hold 512 ports each, mostly idle. A NAT Gateway on the same subnet would share the whole pool dynamically, and 700 connections would simply succeed.</div>

<h3>Measuring it</h3>
<p>NAT Gateway publishes metrics in Azure Monitor. The names vary with portal version (verify exact labels): SNAT connection count, total SNAT connection count, dropped packets, and data path availability. Standard Load Balancer has an SNAT connection count metric with a split for failed connections. Alert when failed or dropped counts rise while connection counts are high.</p>
<pre class="code"><span class="c"># Resource ID of the NAT Gateway</span>
NATID=$(az network nat gateway show -g nk-nat-rg -n nk-nat-gw --query id -o tsv)

<span class="c"># List metric names that are available (do not guess; read them)</span>
az monitor metrics list-definitions --resource $NATID --query "[].name.value" -o tsv

<span class="c"># Read one metric, 5-minute grain, last hour (metric name: pick from the list above)</span>
az monitor metrics list --resource $NATID --metric "SNATConnectionCount" --interval PT5M --offset 1h</pre>
<pre class="out">Illustrative output
Name                  Value
--------------------  -----
PacketCount
ByteCount
DroppedPackets
TotalConnectionCount
SNATConnectionCount
<span class="hl">(your list can differ: use what the command returns)</span></pre>

<h3>Fixing it, in order of effort</h3>
<ol>
<li><b>Reuse connections.</b> Enable HTTP keep-alive, use connection pools, reuse sessions. Biggest win, no cost.</li>
<li><b>Add public IPs</b> or switch to a public IP prefix on the NAT Gateway. Each address adds about 64,512 ports (verify).</li>
<li><b>Move from load balancer SNAT to a NAT Gateway.</b> Dynamic sharing across the subnet.</li>
<li><b>Reduce idle timeout</b> where applications tolerate it, so ports return to the pool sooner.</li>
<li><b>Use Private Link or service endpoints</b> for Azure PaaS traffic so it does not go through SNAT at all.</li>
<li><b>Spread destinations</b>, for example by using more backend IPs on the remote service.</li>
</ol>

<div class="warn"><b>Common mistakes.</b> Adding VMs to "fix" timeouts (this adds SNAT demand); raising the idle timeout to 120 minutes without checking port budget; treating every timeout as a firewall problem before measuring SNAT.</div>
<div class="exam"><b>Exam trap.</b> SNAT exhaustion affects <b>new</b> outbound connections only, and is intermittent. Existing flows continue. It is not caused by inbound traffic.</div>

<div class="scn"><h4>Black Friday timeouts</h4><p>A shop's checkout service called a card processor and began timing out only during sales peaks. CPU was low and the processor reported no errors. The engineer plotted failed SNAT connections and saw them rising exactly with order volume. The code created a new TLS connection per payment call. Enabling connection pooling cut peak ports in use by 90 percent, and a second public IP on the NAT Gateway gave a safety margin.</p><p><b>Lesson:</b> fix the application behaviour first, then add capacity.</p></div>

<div class="iv"><p class="q">"Users report random timeouts to an external API from VMs behind a NAT Gateway. What do you check?"</p><p>Check SNAT metrics (connection count, dropped packets) on the gateway, compare with the number of connections to that single destination, review whether the app pools connections, and consider more public IPs or a prefix. Mention that exhaustion hits only new connections and is intermittent.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Each public IP has about 64,512 SNAT ports (verify); ports are reusable for different destinations.</li>
<li>Exhaustion causes intermittent failures of NEW outbound connections.</li>
<li>Connection reuse is the cheapest and best fix.</li>
<li>Add public IPs or a prefix, or move from LB SNAT to NAT Gateway, for capacity.</li>
<li>Measure with Azure Monitor metrics before and after changes.</li>
</ul></div>
`,hi:`
<h3>Ports scarce resource hain</h3>
<p>TCP ya UDP connection paanch values se pehchana jaata hai: protocol, source IP, source port, destination IP, destination port. Jab 200 VMs ek public IP share karte hain, NAT device ko har outbound connection ko us IP par unique <b>source port</b> dena padta hai taaki replies alag pehchane ja sakein. Ek public IP ke lagbhag 64,512 usable ports hote hain (verify), yaani budget limited hai. Par rule thoda subtle hai: ek port <b>alag destination ke liye reuse</b> ho sakta hai. 203.0.113.50:1024 jaisa pair server A se aur usi waqt alag IP ya port wale server B se baat kar sakta hai. Dikkat tab aati hai jab bahut saare connections <b>same destination IP aur port</b> par jaate hain, jaise 198.51.100.30:443 par ek busy payment API.</p>

<h3>Exhaustion kaisa dikhta hai</h3>
`+r+`
<ul>
<li>External services ko intermittent timeouts ya connection resets, aksar load mein ya aise deploy ke baad jo bahut connections kholta hai.</li>
<li>Application se "cannot assign requested address" jaise errors ya logs mein retry storm.</li>
<li>VM healthy, CPU theek, DNS resolve ho raha, aur ek manual curl chalta hai. Sirf bursts fail hote hain.</li>
<li>NAT Gateway ya load balancer par dropped packets ya failed connections ka graph traffic ke saath badhta hai.</li>
</ul>

<h3>Kyun hota hai</h3>
<ul>
<li><b>Connection reuse nahi.</b> Code har request par naya HTTPS connection kholta hai, keep-alive aur pooling nahi karta.</li>
<li><b>Lambe idle timeouts.</b> Aakhri packet ke baad ports minutes tak rukte hain.</li>
<li><b>Hot destination.</b> Ek IP aur port par hazaaron flows.</li>
<li><b>Public IPs kam</b> hain VMs ya traffic ki tulna mein.</li>
<li><b>Load balancer par fixed per-VM allocation.</b> Default allocation mein backend pool ko har instance ke liye ports ki table milti hai jo pool badhne par chhoti hoti jaati hai. Illustration ke liye (exact table verify karo): 50 VMs tak ke pool mein har ek ko 1,024 ports, 51 se 100 VMs mein 512 har ek, aur aise hi. Tab ek VM apne hisse se zyada use nahi kar sakta bhale baaki idle hon.</li>
</ul>

<div class="eg"><b>Worked example.</b> Standard Load Balancer ke paas ek outbound frontend IP hai, jo lagbhag 64,000 ports deta hai. Pool mein 60 VMs hain, isliye har VM ko 512 ports mile (illustrative). Ek VM par batch job 198.51.100.30:443 ke liye 700 parallel connections kholta hai. 513va connection ke liye port nahi: fail. Idhar 59 baaki VMs 512-512 ports pakde baithe hain, zyadatar idle. Same subnet par NAT Gateway poora pool dynamically share karta aur 700 connections aaram se chal jaate.</div>

<h3>Measure karna</h3>
<p>NAT Gateway Azure Monitor mein metrics publish karta hai. Naam portal version ke saath badalte hain (exact labels verify karo): SNAT connection count, total SNAT connection count, dropped packets, aur data path availability. Standard Load Balancer mein SNAT connection count metric hai jisme failed connections ka split hota hai. Jab connection counts high hon aur failed ya dropped counts badhein tab alert lagao.</p>
<pre class="code"><span class="c"># NAT Gateway ka resource ID</span>
NATID=$(az network nat gateway show -g nk-nat-rg -n nk-nat-gw --query id -o tsv)

<span class="c"># Available metric names dekho (andaza mat lagao; padho)</span>
az monitor metrics list-definitions --resource $NATID --query "[].name.value" -o tsv

<span class="c"># Ek metric padho, 5-minute grain, pichla ek ghanta (metric name upar ki list se chuno)</span>
az monitor metrics list --resource $NATID --metric "SNATConnectionCount" --interval PT5M --offset 1h</pre>
<pre class="out">Illustrative output
Name                  Value
--------------------  -----
PacketCount
ByteCount
DroppedPackets
TotalConnectionCount
SNATConnectionCount
<span class="hl">(aapki list alag ho sakti hai: command jo de wahi use karo)</span></pre>

<h3>Fix karna, mehnat ke order mein</h3>
<ol>
<li><b>Connections reuse karo.</b> HTTP keep-alive on karo, connection pools aur sessions reuse karo. Sabse bada fayda, koi cost nahi.</li>
<li>NAT Gateway par <b>public IPs jodo</b> ya public IP prefix lagao. Har address lagbhag 64,512 ports jodta hai (verify).</li>
<li><b>Load balancer SNAT se NAT Gateway par jao.</b> Subnet mein dynamic sharing.</li>
<li>Jahan application sahan kare wahan <b>idle timeout kam karo</b> taaki ports pool mein jaldi lautein.</li>
<li>Azure PaaS traffic ke liye <b>Private Link ya service endpoints</b> use karo taaki woh SNAT se guzre hi nahi.</li>
<li><b>Destinations failao</b>, jaise remote service ke zyada backend IPs use karke.</li>
</ol>

<div class="warn"><b>Common mistakes.</b> Timeouts "fix" karne ke liye VMs badhana (isse SNAT demand badhta hai); port budget dekhe bina idle timeout 120 minute kar dena; har timeout ko measure kiye bina firewall problem maan lena.</div>
<div class="exam"><b>Exam trap.</b> SNAT exhaustion sirf <b>naye</b> outbound connections ko affect karta hai, aur intermittent hota hai. Maujooda flows chalte rehte hain. Yeh inbound traffic se nahi hota.</div>

<div class="scn"><h4>Black Friday timeouts</h4><p>Ek shop ki checkout service card processor ko call karti thi aur sirf sale peaks mein timeout hone lagi. CPU kam tha aur processor ne koi error report nahi kiya. Engineer ne failed SNAT connections plot kiye aur dekha ki woh bilkul order volume ke saath badhte hain. Code har payment call par naya TLS connection banata tha. Connection pooling on karne se peak ports 90 percent kam hue, aur NAT Gateway par doosra public IP safety margin de gaya.</p><p><b>Lesson:</b> pehle application behaviour theek karo, phir capacity badhao.</p></div>

<div class="iv"><p class="q">"NAT Gateway ke peeche VMs se external API ko random timeouts aa rahe hain. Aap kya check karoge?"</p><p>Gateway par SNAT metrics (connection count, dropped packets) dekho, us ek destination ke connections ki sankhya se compare karo, dekho ki app connections pool karti hai ya nahi, aur zyada public IPs ya prefix soch lo. Batao ki exhaustion sirf naye connections ko hit karta hai aur intermittent hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har public IP ke lagbhag 64,512 SNAT ports hote hain (verify); alag destinations ke liye ports reuse hote hain.</li>
<li>Exhaustion NAYE outbound connections ki intermittent failures banata hai.</li>
<li>Connection reuse sabse sasta aur best fix hai.</li>
<li>Capacity ke liye public IPs ya prefix jodo, ya LB SNAT se NAT Gateway par jao.</li>
<li>Changes se pehle aur baad Azure Monitor metrics se measure karo.</li>
</ul></div>
`}};export{i as default};