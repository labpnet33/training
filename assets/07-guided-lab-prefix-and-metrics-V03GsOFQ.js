var e=e=>`<pre class="code">`+e+(e.endsWith(`</pre>`)?``:`</pre>`),t=e(`<span class="c"># Same variables as the previous lab (RG exists with VNet, VM, NAT Gateway nk-nat-gw)</span>
RG=nk-nat-rg

<span class="c"># 1. Reserve a /31 prefix = 2 contiguous public addresses (billed per address)</span>
az network public-ip prefix create -g $RG -n nk-nat-prefix --length 31 --sku Standard

<span class="c"># 2. Put the prefix on the NAT Gateway (this REPLACES the single IP list; flags: verify with az network nat gateway update -h)</span>
az network nat gateway update -g $RG -n nk-nat-gw --public-ip-prefixes nk-nat-prefix --public-ip-addresses ""

<span class="c"># 3. Look at what the gateway now holds</span>
az network nat gateway show -g $RG -n nk-nat-gw --query "{ips:publicIpAddresses[].id, prefixes:publicIpPrefixes[].id, idle:idleTimeoutInMinutes}"
az network public-ip prefix show -g $RG -n nk-nat-prefix --query ipPrefix -o tsv</pre>
<pre class="out">Illustrative output
<span class="hl">203.0.113.48/31</span>   the range you would hand to a partner for allow-listing`),n=e(`<span class="c"># 4. Make 40 short outbound requests from the VM; note the source IP seen each time</span>
az vm run-command invoke -g $RG -n nk-nat-app-1 --command-id RunShellScript \\
  --scripts "for i in 1 2 3 4 5 6 7 8 9 10; do curl -s -m 10 ifconfig.me; echo; done | sort | uniq -c"</pre>
<pre class="out">Illustrative output (counts depend on the gateway's address choice)
      6 203.0.113.48
      4 203.0.113.49</pre>`),r=e(`<span class="c"># 5. List the metrics the gateway offers, then read one for the last 30 minutes</span>
NATID=$(az network nat gateway show -g $RG -n nk-nat-gw --query id -o tsv)
az monitor metrics list-definitions --resource $NATID --query "[].name.value" -o tsv
az monitor metrics list --resource $NATID --metric "SNATConnectionCount" --interval PT1M --offset 30m -o table

<span class="c"># 6. Change the idle timeout and read it back</span>
az network nat gateway update -g $RG -n nk-nat-gw --idle-timeout 4
az network nat gateway show -g $RG -n nk-nat-gw --query idleTimeoutInMinutes -o tsv</pre>
<pre class="out">Illustrative output
4</pre>`),i=e(`<span class="c"># 7. Break it on purpose: detach the gateway from the subnet</span>
az network vnet subnet update -g $RG --vnet-name nk-nat-vnet -n nk-nat-sn --remove natGateway

<span class="c"># 8. Test (the subnet is private, so this should fail)</span>
az vm run-command invoke -g $RG -n nk-nat-app-1 --command-id RunShellScript \\
  --scripts "curl -s -m 10 ifconfig.me || echo NO-OUTBOUND"

<span class="c"># 9. Fix it again and re-test</span>
az network vnet subnet update -g $RG --vnet-name nk-nat-vnet -n nk-nat-sn --nat-gateway nk-nat-gw</pre>`),a=e(`<span class="c"># One command removes the VM, disk, NIC, VNet, NAT Gateway, public IP AND the prefix</span>
az group delete -n $RG --yes --no-wait

<span class="c"># Prove it later</span>
az group exists -n $RG
az network public-ip prefix list --query "[?contains(name,'nk-nat')]" -o table</pre>`),o={id:`guided-lab-prefix-and-metrics`,h:{en:`Guided lab: public IP prefix, metrics and a deliberate break`,hi:`Guided lab: public IP prefix, metrics aur jaanboojhkar break`},body:{en:`
<h3>Goal</h3>
<p>Extend the previous lab. You will (1) give the NAT Gateway a <b>public IP prefix</b> instead of a single address, so a partner can allow-list one range, (2) watch the VM's outside address come from that range, (3) read SNAT metrics and change the idle timeout, and (4) <b>break outbound on purpose</b> by removing the gateway from the subnet and then fix it. Finally, delete the resource group.</p>

<div class="warn"><b>BILLING WARNING.</b> Everything from the last lab still bills hourly, and a public IP prefix bills for <b>every address in it</b> (verify current rates). Do this lab right after the first one and delete the resource group at the end. If you did the cleanup of the previous lab, rebuild its steps 1 to 10 first.</div>

<h3>Prerequisites</h3>
<ul>
<li>The environment from the previous lab: resource group nk-nat-rg, VNet nk-nat-vnet with subnet nk-nat-sn, VM nk-nat-app-1 without public IP, NAT Gateway nk-nat-gw attached.</li>
<li>The same budget alert. About 30 minutes.</li>
</ul>

<h3>Honest estimated cost</h3>
<p>The extra items are one /31 prefix (two addresses) billed hourly per address. <b>ASSUMED example</b>: if each Standard public address costs 0.005 USD per hour, the prefix adds about 0.01 USD per hour, so an extra hour of lab is about 0.01 USD on top of the gateway, VM and original IP from the previous lab (verify real rates). A forgotten month is the same 45 USD or so for the gateway plus the prefix and VM. The pricing structure matters more than the number: gateway hourly + per GB, each public address hourly.</p>

<h3>Step 1 to 3: reserve and attach a prefix</h3>
<p><b>Portal (unverified wording):</b> Public IP prefixes, Create: name nk-nat-prefix, prefix size /31 (2 addresses), IPv4, Standard. Then NAT gateways, nk-nat-gw, Outbound IP, Public IP prefixes, add nk-nat-prefix. A prefix cannot be resized; to grow, create a new, larger one.</p>
<p><b>CLI:</b></p>
`+t+`
<h3>Step 4: see the outside address</h3>
<p>The gateway chooses between its addresses per flow, so repeated tests show both addresses of the /31. A partner that allow-lists 203.0.113.48/31 covers all of them.</p>
`+n+`
<h3>Steps 5 and 6: metrics and idle timeout</h3>
<p><b>Portal (unverified wording):</b> NAT gateways, nk-nat-gw, Monitoring, Metrics. Pick the SNAT connection or dropped packets metric, split by connection state if offered. Use a 4-minute idle timeout for chatty short-lived calls; use a longer one only for applications with long quiet connections, because idle ports are held that long.</p>
`+r+`
<h3>Steps 7 to 9: break it, then fix it</h3>
<p>Removing the association from the subnet is the most common real-world outage: someone "tidies" the network and the gateway silently stops serving that subnet. The VM keeps running; only new outbound connections fail.</p>
`+i+`
<pre class="out">Illustrative output
<span class="hl">NO-OUTBOUND</span>   while the subnet has no NAT Gateway and no other method
203.0.113.48   after re-associating</pre>

<h3>Cleanup (mandatory)</h3>
`+a+`

<h3>What bills you: the trap list</h3>
<ul>
<li><b>NAT Gateway</b> hourly plus per GB; <b>Standard public IPs</b> and <b>every address in a prefix</b> hourly.</li>
<li><b>Prefixes survive deleting the gateway.</b> A prefix is its own resource and keeps billing until deleted.</li>
<li><b>VM disk</b> after deallocation.</li>
<li><b>Azure Firewall, Application Gateway v2, VPN or ExpressRoute gateways, Bastion</b>: hourly resources people add while experimenting. Check the resource group list before you finish.</li>
</ul>

<div class="warn"><b>Common mistakes.</b> Replacing individual public IPs with a prefix and forgetting that the old addresses are no longer used; telling a partner an address list instead of the prefix; setting the idle timeout very long "to be safe" and then exhausting ports.</div>
<div class="exam"><b>Exam trap.</b> Public IP prefixes are contiguous blocks: /28 gives 16 addresses, /31 gives 2. You cannot add arbitrary existing IPs into one or resize it.</div>

<div class="scn"><h4>The tidy-up that broke production egress</h4><p>During a "network clean-up", an engineer removed what looked like an unused NAT Gateway association from a subnet. Applications still ran, but payment and update calls started timing out because the subnet was private and now had no outbound method. The activity log showed the subnet write that removed the gateway. They re-associated it and added a resource lock on the gateway and its public IP.</p><p><b>Lesson:</b> use the Activity log and resource locks; changes to NAT association are production-impacting.</p></div>

<div class="iv"><p class="q">"Why would you attach a public IP prefix instead of several individual public IPs?"</p><p>Because a partner can allow-list one CIDR range instead of a list, the addresses are contiguous and predictable, and capacity grows with the prefix size. The trade-off is that prefix size is fixed and every address in it bills.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A prefix gives the gateway a contiguous allow-list range (/31 = 2 addresses).</li>
<li>The gateway distributes flows across its addresses; test repeatedly to see them.</li>
<li>Read SNAT and dropped-packet metrics; tune idle timeout only with evidence.</li>
<li>Removing the subnet association is a classic outage; protect with locks.</li>
<li>Delete the resource group; check for stray prefixes and public IPs.</li>
</ul></div>
`,hi:`
<h3>Goal</h3>
<p>Pichle lab ko aage badhao. Aap (1) NAT Gateway ko ek address ki jagah <b>public IP prefix</b> doge taaki partner ek range allow-list kar sake, (2) dekhoge ki VM ka outside address us range se aa raha hai, (3) SNAT metrics padhoge aur idle timeout badloge, aur (4) subnet se gateway hatakar <b>jaanboojhkar outbound todoge</b> aur phir fix karoge. Aakhir mein resource group delete karoge.</p>

<div class="warn"><b>BILLING WARNING.</b> Pichle lab ki har cheez abhi bhi ghante ke hisaab se bill hoti hai, aur public IP prefix <b>apne har address</b> ka bill deta hai (current rates verify karo). Yeh lab pehle lab ke turant baad karo aur end mein resource group delete karo. Pichle lab ka cleanup kar diya ho to pehle uske steps 1 se 10 dobara banao.</div>

<h3>Prerequisites</h3>
<ul>
<li>Pichle lab ka environment: resource group nk-nat-rg, VNet nk-nat-vnet subnet nk-nat-sn ke saath, bina public IP ka VM nk-nat-app-1, attached NAT Gateway nk-nat-gw.</li>
<li>Wahi budget alert. Lagbhag 30 minute.</li>
</ul>

<h3>Imaandaar estimated cost</h3>
<p>Extra cheezein ek /31 prefix (do addresses) hain jo har address ke hisaab se ghante ke bill par aata hai. <b>ASSUMED example</b>: agar har Standard public address 0.005 USD per hour ho to prefix lagbhag 0.01 USD per hour jodta hai, yaani pichle lab ke gateway, VM aur original IP ke upar lab ka extra ghanta lagbhag 0.01 USD (asli rates verify karo). Bhoola hua mahina wahi 45 USD ke aas-paas gateway ka, plus prefix aur VM. Number se zyada pricing structure zaroori hai: gateway hourly + per GB, har public address hourly.</p>

<h3>Step 1 se 3: prefix reserve karo aur attach karo</h3>
<p><b>Portal (unverified wording):</b> Public IP prefixes, Create: name nk-nat-prefix, prefix size /31 (2 addresses), IPv4, Standard. Phir NAT gateways, nk-nat-gw, Outbound IP, Public IP prefixes, nk-nat-prefix jodo. Prefix resize nahi hota; badhane ke liye naya, bada banao.</p>
<p><b>CLI:</b></p>
`+t+`
<h3>Step 4: outside address dekho</h3>
<p>Gateway har flow ke liye apne addresses mein se chunta hai, isliye baar-baar test karne par /31 ke dono addresses dikhte hain. Jo partner 203.0.113.48/31 allow-list karta hai woh sab cover karta hai.</p>
`+n+`
<h3>Step 5 aur 6: metrics aur idle timeout</h3>
<p><b>Portal (unverified wording):</b> NAT gateways, nk-nat-gw, Monitoring, Metrics. SNAT connection ya dropped packets metric chuno, connection state se split karo agar mile. Chatty short-lived calls ke liye 4-minute idle timeout use karo; lamba timeout sirf un applications ke liye jinke connections lambe waqt shaant rehte hain, kyunki idle ports utni der tak rukte hain.</p>
`+r+`
<h3>Step 7 se 9: todo, phir fix karo</h3>
<p>Subnet se association hatana sabse common real-world outage hai: koi "network tidy" karta hai aur gateway chupchaap us subnet ko serve karna band kar deta hai. VM chalta rehta hai; sirf naye outbound connections fail hote hain.</p>
`+i+`
<pre class="out">Illustrative output
<span class="hl">NO-OUTBOUND</span>   jab tak subnet par NAT Gateway ya koi aur method nahi
203.0.113.48   dobara associate karne ke baad</pre>

<h3>Cleanup (mandatory)</h3>
`+a+`

<h3>Kya bill karta hai: trap list</h3>
<ul>
<li><b>NAT Gateway</b> hourly plus per GB; <b>Standard public IPs</b> aur <b>prefix ka har address</b> hourly.</li>
<li><b>Gateway delete karne par prefix bach jaata hai.</b> Prefix alag resource hai aur delete hone tak bill karta rehta hai.</li>
<li>Deallocation ke baad <b>VM disk</b>.</li>
<li><b>Azure Firewall, Application Gateway v2, VPN ya ExpressRoute gateways, Bastion</b>: hourly resources jo log experiment mein jodte hain. Khatam karne se pehle resource group ki list check karo.</li>
</ul>

<div class="warn"><b>Common mistakes.</b> Individual public IPs ko prefix se replace karke bhool jaana ki purane addresses ab use nahi hote; partner ko prefix ki jagah address list batana; "safe side" ke liye idle timeout bahut lamba karna aur phir ports exhaust karna.</div>
<div class="exam"><b>Exam trap.</b> Public IP prefixes contiguous blocks hain: /28 se 16 addresses, /31 se 2. Aap usme koi bhi existing IP nahi jod sakte ya resize nahi kar sakte.</div>

<div class="scn"><h4>Tidy-up jisne production egress tod diya</h4><p>"Network clean-up" ke dauran ek engineer ne subnet se unused lagne wale NAT Gateway association ko hata diya. Applications chalte rahe, par payment aur update calls timeout hone lage kyunki subnet private tha aur ab koi outbound method nahi tha. Activity log mein woh subnet write dikha jisne gateway hataya. Unhone dobara associate kiya aur gateway tatha uske public IP par resource lock lagaya.</p><p><b>Lesson:</b> Activity log aur resource locks use karo; NAT association ke changes production-impacting hain.</p></div>

<div class="iv"><p class="q">"Kai individual public IPs ki jagah public IP prefix kyun attach karoge?"</p><p>Kyunki partner list ki jagah ek CIDR range allow-list kar sakta hai, addresses contiguous aur predictable hain, aur capacity prefix size ke saath badhti hai. Trade-off yeh hai ki prefix size fixed hai aur uska har address bill karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Prefix gateway ko contiguous allow-list range deta hai (/31 = 2 addresses).</li>
<li>Gateway flows ko apne addresses mein baant deta hai; dekhne ke liye baar-baar test karo.</li>
<li>SNAT aur dropped-packet metrics padho; idle timeout sirf evidence ke saath tune karo.</li>
<li>Subnet association hatana classic outage hai; locks se bachao.</li>
<li>Resource group delete karo; stray prefixes aur public IPs check karo.</li>
</ul></div>
`}};export{o as default};