var e=e=>`<pre class="code">`+e+(e.endsWith(`</pre>`)?``:`</pre>`),t=e(`RG=nk-agw-rg
LOC=centralindia
az group create -n $RG -l $LOC --tags Project=nk-agw-lab

<span class="c"># VNet with a DEDICATED gateway subnet and a backend subnet</span>
az network vnet create -g $RG -n nk-agw-vnet --address-prefixes 10.40.0.0/16 --subnet-name agw-sn --subnet-prefixes 10.40.1.0/24
az network vnet subnet create -g $RG --vnet-name nk-agw-vnet -n be-sn --address-prefixes 10.40.2.0/24

<span class="c"># cloud-init: a tiny web server with no package install (python3 is already on the image)</span>
cat &gt; web-init.txt &lt;&lt;'EOF'
#cloud-config
runcmd:
  - mkdir -p /srv/web
  - echo "Hello from $(hostname)" &gt; /srv/web/index.html
  - systemd-run --unit=nkweb --working-directory=/srv/web python3 -m h&#116;tp.server 80
EOF

<span class="c"># Two backend VMs with fixed private IPs and no public IP</span>
for N in 1 2; do
  az vm create -g $RG -n web-$N --image Ubuntu2204 --size Standard_B1s --vnet-name nk-agw-vnet --subnet be-sn \\
    --public-ip-address "" --nsg "" --private-ip-address 10.40.2.$((3+N)) --custom-data web-init.txt \\
    --admin-username azureuser --generate-ssh-keys --no-wait
done
az vm wait -g $RG -n web-2 --created</pre>`),n=e(`<span class="c"># Standard static public IP, then the gateway (this takes roughly 5 to 15 minutes; billing starts)</span>
az network public-ip create -g $RG -n agw-pip --sku Standard --allocation-method Static
az network application-gateway create -g $RG -n nk-agw --sku Standard_v2 --capacity 1 --priority 100 \\
  --vnet-name nk-agw-vnet --subnet agw-sn --public-ip-address agw-pip \\
  --frontend-port 80 --servers 10.40.2.4 10.40.2.5

<span class="c"># Backend health: both servers should be Healthy</span>
az network application-gateway show-backend-health -g $RG -n nk-agw -o json | grep -i '"address"\\|"health"'</pre>
<pre class="out">Illustrative output
"address": "10.40.2.4",
"health": <span class="hl">"Healthy"</span>,
"address": "10.40.2.5",
"health": <span class="hl">"Healthy"</span>,</pre>`),r=e(`<span class="c"># Call the gateway from your machine</span>
IP=$(az network public-ip show -g $RG -n agw-pip --query ipAddress -o tsv)
for i in 1 2 3 4 5 6; do curl -s -m 5 $IP; done

<span class="c"># Look at the objects (listener, rule, backend settings, pool, probe)</span>
az network application-gateway show -g $RG -n nk-agw --query "{sku:sku, listeners:h&#116;tpListeners[].name, rules:requestRoutingRules[].name, pools:backendAddressPools[].name}"</pre>
<pre class="out">Illustrative output
Hello from web-1
Hello from web-2
Hello from web-1
Hello from web-2</pre>`),i=e(`<span class="c"># Add a custom probe for /health and attach it to the backend settings (flag and object names: verify with -h)</span>
az network application-gateway probe create -g $RG --gateway-name nk-agw -n hp-health --protocol Http \\
  --host 127.0.0.1 --path /health --interval 15 --timeout 15 --threshold 2
az network application-gateway h&#116;tp-settings update -g $RG --gateway-name nk-agw -n appGatewayBackendHttpSettings --probe hp-health

<span class="c"># The backends have no /health file yet, so they return 404 and the probe fails: expect 502</span>
curl -s -o /dev/null -w "%{response_code}\\n" $IP</pre>
<pre class="out">Illustrative output (allow a minute for the probe to run)
<span class="hl">502</span>   Bad Gateway: no healthy backend</pre>`),a=e(`<span class="c"># Fix the application, not the gateway: create the health file on both VMs</span>
for N in 1 2; do
  az vm run-command invoke -g $RG -n web-$N --command-id RunShellScript --scripts "echo ok &gt; /srv/web/health"
done

<span class="c"># After a minute the probe passes and traffic returns</span>
curl -s -o /dev/null -w "%{response_code}\\n" $IP</pre>
<pre class="out">Illustrative output
<span class="hl">200</span></pre>`),o=e(`<span class="c"># DELETE NOW: Application Gateway v2 bills hourly, even idle</span>
az group delete -n $RG --yes --no-wait

<span class="c"># Prove it later</span>
az group exists -n $RG
az resource list --tag Project=nk-agw-lab -o table
az network application-gateway list --query "[].name" -o tsv</pre>
<pre class="out">Illustrative output
false</pre>`),s={id:`guided-lab-application-gateway`,h:{en:`Guided lab: an Application Gateway v2 (short and costly: delete it)`,hi:`Guided lab: Application Gateway v2 (chhota aur mehnga: delete karo)`},body:{en:`
<h3>Goal</h3>
<p>Create a small Application Gateway v2 in front of two web VMs, send requests through it, deliberately make the health probe fail to see a <b>502 Bad Gateway</b>, fix the application, and then <b>delete the resource group within the hour</b>. This lab teaches the layer-7 objects (listener, rule, backend settings, pool, probe) and why probes cause 502.</p>

<div class="warn"><b>LOUD BILLING WARNING.</b> Application Gateway v2 bills a <b>fixed hourly charge plus capacity units, from the moment it is created until it is deleted</b>, even with no traffic, and it costs far more per hour than the VMs. The Standard public IP also bills hourly. Plan to finish in one sitting (about 45 minutes), then run the cleanup immediately. Never leave it overnight. Do <b>not</b> enable WAF or add extra gateway instances in a practice account.</div>

<h3>Prerequisites</h3>
<ul>
<li>Azure subscription and Azure CLI 2.x signed in, Bash shell (or Azure Cloud Shell in Bash).</li>
<li>A <b>budget alert</b> already created. The application-gateway chapter read first.</li>
<li>Enough quota for one v2 gateway and two small VMs in your chosen region.</li>
</ul>

<h3>Honest estimated cost</h3>
<p>Application Gateway v2 charges a fixed hourly fee for the gateway and an hourly charge per capacity unit consumed (verify the structure on the pricing page). <b>ASSUMED rates only</b>: 0.25 USD per fixed gateway hour, 0.008 USD per capacity unit hour with about 1 unit in use, 0.005 USD per public IP hour, 0.012 USD per VM hour for two VMs. Total roughly 0.29 USD per hour. A one-hour lab is about 0.29 USD; the same assumptions over a forgotten month give roughly 210 USD. Replace the assumptions with real rates from the pricing calculator for your region.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Lab architecture">
<rect x="10" y="50" width="80" height="50" rx="6" fill="#fed7aa"/><text x="50" y="80" text-anchor="middle" class="svg-ink" font-size="13">curl</text>
<rect x="120" y="20" width="190" height="110" rx="8" fill="#fde68a"/><text x="215" y="42" text-anchor="middle" class="svg-ink" font-size="13">App Gateway v2</text><text x="215" y="62" text-anchor="middle" class="svg-muted" font-size="12">agw-sn 10.40.1.0/24</text><text x="215" y="82" text-anchor="middle" class="svg-muted" font-size="12">listener 80, rule, pool</text><text x="215" y="104" text-anchor="middle" class="svg-accent" font-size="12">probe /health</text>
<rect x="360" y="20" width="270" height="110" rx="8" fill="#f1f5f9" stroke="#94a3b8"/><text x="495" y="40" text-anchor="middle" class="svg-muted" font-size="12">be-sn 10.40.2.0/24</text>
<rect x="380" y="55" width="110" height="40" rx="6" fill="#bbf7d0"/><text x="435" y="80" text-anchor="middle" class="svg-ink" font-size="12">web-1 .4</text>
<rect x="500" y="55" width="110" height="40" rx="6" fill="#bbf7d0"/><text x="555" y="80" text-anchor="middle" class="svg-ink" font-size="12">web-2 .5</text>
<line x1="90" y1="75" x2="120" y2="75" stroke="#64748b" stroke-width="2"/><line x1="310" y1="75" x2="380" y2="75" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The gateway sits in its own subnet; the backends do not need public IPs.</p></div>

<div class="note"><b>Portal wording</b> is from memory and changes often. Treat labels as unverified; az commands are the reliable route, though some flag names can differ by CLI version (verify with the <code>-h</code> help).</div>

<h3>Step 1: network, subnets and two backends</h3>
<p><b>Portal (unverified wording):</b> create nk-agw-rg (tag Project = nk-agw-lab); a VNet nk-agw-vnet 10.40.0.0/16 with subnets agw-sn 10.40.1.0/24 (leave it empty) and be-sn 10.40.2.0/24; two small Ubuntu VMs in be-sn with no public IP, with the custom data shown in the CLI box.</p>
<p><b>CLI:</b></p>
`+t+`
<h3>Step 2: the gateway</h3>
<p><b>Portal (unverified wording):</b> Application gateways, Create: tier Standard V2, scale method Manual with 1 instance (do not enable autoscaling above 1 in a lab), nk-agw-vnet / agw-sn, a new Standard static public IP agw-pip; Backends tab: pool with the two IPs 10.40.2.4 and 10.40.2.5; Configuration tab: routing rule with a listener on port 80 and backend settings port 80. Creation takes several minutes.</p>
<p><b>CLI:</b></p>
`+n+`
<h3>Step 3: send traffic</h3>
`+r+`
<h3>Step 4: break the probe, observe 502</h3>
<p><b>Portal (unverified wording):</b> Application gateway, Health probes, Add: protocol HTTP, host 127.0.0.1, path /health; then Backend settings, edit the setting, choose Use custom probe. Backend health blade shows Unhealthy.</p>
`+i+`
<h3>Step 5: fix the application</h3>
`+a+`
<p>You changed the app, not the gateway: this is the real-life pattern, because a probe expresses what the application promises.</p>

<h3>Cleanup (mandatory, do it now)</h3>
`+o+`

<h3>What bills you: the trap list</h3>
<ul>
<li><b>Application Gateway v2</b>: fixed hourly plus capacity units, from creation to deletion; far more than the VMs. WAF_v2 costs more per hour.</li>
<li><b>Standard public IP</b>: hourly. The gateway subnet itself is free.</li>
<li><b>VMs and disks</b>: until deleted.</li>
<li><b>Azure Firewall, NAT Gateway, VPN gateways, Bastion</b>: hourly if you added them.</li>
<li><b>Stopped gateways</b>: a v1 gateway could be stopped; do not rely on that; delete the resource.</li>
<li><b>Forgotten resource groups</b> and other regions; search by tag Project.</li>
</ul>

<div class="warn"><b>Common mistakes.</b> Putting VMs in the gateway subnet; attaching an NSG to the gateway subnet that blocks management ports; assuming 502 means the gateway is broken when the backends fail the probe; leaving the gateway running to "finish tomorrow".</div>
<div class="exam"><b>Exam trap.</b> Application Gateway needs its own dedicated subnet. A 502 means no healthy backend; check probe path, port, host header and backend response.</div>

<div class="scn"><h4>The 502 and the missing health file</h4><p>A team added a custom probe on /health and shipped. Every request returned 502. The gateway was fine; the new probe path did not exist on the servers (404). Creating the health endpoint in the app, not changing the gateway, restored 200 within a minute, and a release check was added to verify the probe path before deployment.</p><p><b>Lesson:</b> a probe is a contract between gateway and application.</p></div>

<div class="iv"><p class="q">"Application Gateway returns 502. How do you diagnose it?"</p><p>Check backend health in the portal or with show-backend-health. If Unhealthy: probe path, port, protocol and host header, backend settings, NSG and routing from the gateway subnet to the backends, backend certificate for end-to-end TLS, and the app response code. Fix the cause (usually the app or probe), not the gateway.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Gateway needs its own subnet; it bills hourly from creation.</li>
<li>Core objects: listener, rule, backend settings, pool, probe.</li>
<li>502 usually means no healthy backend.</li>
<li>Show-backend-health is the first diagnostic.</li>
<li>Delete the resource group within the hour.</li>
</ul></div>
`,hi:`
<h3>Goal</h3>
<p>Do web VMs ke saamne chhota Application Gateway v2 banao, uske through requests bhejo, jaanboojhkar health probe fail karke <b>502 Bad Gateway</b> dekho, application fix karo, aur phir <b>ek ghante ke andar resource group delete</b> karo. Yeh lab layer-7 objects (listener, rule, backend settings, pool, probe) aur yeh sikhata hai ki probes 502 kyun dete hain.</p>

<div class="warn"><b>LOUD BILLING WARNING.</b> Application Gateway v2 <b>banne ke pal se delete hone tak fixed hourly charge plus capacity units</b> bill karta hai, traffic ke bina bhi, aur ghante ke hisaab se VMs se kaafi zyada mehnga hai. Standard public IP bhi hourly bill hota hai. Ek sitting mein (lagbhag 45 minute) khatam karne ka plan rakho, phir turant cleanup chalao. Raat bhar kabhi mat chhodo. Practice account mein WAF on <b>mat</b> karo aur extra gateway instances mat jodo.</div>

<h3>Prerequisites</h3>
<ul>
<li>Azure subscription aur Azure CLI 2.x sign-in ke saath, Bash shell (ya Azure Cloud Shell Bash mein).</li>
<li>Pehle se bana <b>budget alert</b>. Pehle application-gateway chapter padho.</li>
<li>Apne region mein ek v2 gateway aur do chhote VMs ke liye kaafi quota.</li>
</ul>

<h3>Imaandaar estimated cost</h3>
<p>Application Gateway v2 gateway ka fixed hourly fee aur consume hue har capacity unit ka hourly charge leta hai (pricing page par structure verify karo). <b>Sirf ASSUMED rates</b>: 0.25 USD per fixed gateway hour, 0.008 USD per capacity unit hour jahan lagbhag 1 unit use ho, 0.005 USD per public IP hour, do VMs ke liye 0.012 USD per VM hour. Kul lagbhag 0.29 USD per hour. Ek ghante ka lab lagbhag 0.29 USD; wahi assumptions bhoole hue mahine par lagbhag 210 USD dete hain. Assumptions ko apne region ke pricing calculator ke asli rates se badal do.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Lab architecture">
<rect x="10" y="50" width="80" height="50" rx="6" fill="#fed7aa"/><text x="50" y="80" text-anchor="middle" class="svg-ink" font-size="13">curl</text>
<rect x="120" y="20" width="190" height="110" rx="8" fill="#fde68a"/><text x="215" y="42" text-anchor="middle" class="svg-ink" font-size="13">App Gateway v2</text><text x="215" y="62" text-anchor="middle" class="svg-muted" font-size="12">agw-sn 10.40.1.0/24</text><text x="215" y="82" text-anchor="middle" class="svg-muted" font-size="12">listener 80, rule, pool</text><text x="215" y="104" text-anchor="middle" class="svg-accent" font-size="12">probe /health</text>
<rect x="360" y="20" width="270" height="110" rx="8" fill="#f1f5f9" stroke="#94a3b8"/><text x="495" y="40" text-anchor="middle" class="svg-muted" font-size="12">be-sn 10.40.2.0/24</text>
<rect x="380" y="55" width="110" height="40" rx="6" fill="#bbf7d0"/><text x="435" y="80" text-anchor="middle" class="svg-ink" font-size="12">web-1 .4</text>
<rect x="500" y="55" width="110" height="40" rx="6" fill="#bbf7d0"/><text x="555" y="80" text-anchor="middle" class="svg-ink" font-size="12">web-2 .5</text>
<line x1="90" y1="75" x2="120" y2="75" stroke="#64748b" stroke-width="2"/><line x1="310" y1="75" x2="380" y2="75" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Gateway apne subnet mein baithta hai; backends ko public IPs nahi chahiye.</p></div>

<div class="note"><b>Portal wording</b> yaad se hai aur aksar badalta hai. Labels ko unverified maano; az commands bharosemand route hain, par kuch flag names CLI version ke saath alag ho sakte hain (<code>-h</code> help se verify karo).</div>

<h3>Step 1: network, subnets aur do backends</h3>
<p><b>Portal (unverified wording):</b> nk-agw-rg banao (tag Project = nk-agw-lab); VNet nk-agw-vnet 10.40.0.0/16 subnets agw-sn 10.40.1.0/24 (khaali rakho) aur be-sn 10.40.2.0/24 ke saath; be-sn mein do chhote Ubuntu VMs bina public IP ke, CLI box mein diye custom data ke saath.</p>
<p><b>CLI:</b></p>
`+t+`
<h3>Step 2: gateway</h3>
<p><b>Portal (unverified wording):</b> Application gateways, Create: tier Standard V2, scale method Manual 1 instance ke saath (lab mein 1 se upar autoscaling on mat karo), nk-agw-vnet / agw-sn, naya Standard static public IP agw-pip; Backends tab: pool jisme do IPs 10.40.2.4 aur 10.40.2.5; Configuration tab: port 80 par listener aur backend settings port 80 wala routing rule. Creation mein kuch minute lagte hain.</p>
<p><b>CLI:</b></p>
`+n+`
<h3>Step 3: traffic bhejo</h3>
`+r+`
<h3>Step 4: probe todo, 502 dekho</h3>
<p><b>Portal (unverified wording):</b> Application gateway, Health probes, Add: protocol HTTP, host 127.0.0.1, path /health; phir Backend settings, setting edit karo, Use custom probe chuno. Backend health blade Unhealthy dikhata hai.</p>
`+i+`
<h3>Step 5: application fix karo</h3>
`+a+`
<p>Aapne app badla, gateway nahi: real life mein yahi pattern hai, kyunki probe batata hai application kya promise karti hai.</p>

<h3>Cleanup (mandatory, abhi karo)</h3>
`+o+`

<h3>Kya bill karta hai: trap list</h3>
<ul>
<li><b>Application Gateway v2</b>: fixed hourly plus capacity units, creation se deletion tak; VMs se kaafi zyada. WAF_v2 per hour zyada mehnga.</li>
<li><b>Standard public IP</b>: hourly. Gateway subnet khud free hai.</li>
<li><b>VMs aur disks</b>: delete hone tak.</li>
<li><b>Azure Firewall, NAT Gateway, VPN gateways, Bastion</b>: jodo to hourly.</li>
<li><b>Stopped gateways</b>: v1 gateway stop ho sakta tha; us par rely mat karo; resource delete karo.</li>
<li><b>Bhoole hue resource groups</b> aur doosre regions; Project tag se search karo.</li>
</ul>

<div class="warn"><b>Common mistakes.</b> Gateway subnet mein VMs rakhna; gateway subnet par aisa NSG lagana jo management ports block kare; sochna ki 502 matlab gateway kharab hai jabki backends probe fail kar rahe hain; "kal khatam karunga" kehkar gateway chalta chhodna.</div>
<div class="exam"><b>Exam trap.</b> Application Gateway ko apna dedicated subnet chahiye. 502 matlab koi healthy backend nahi; probe path, port, host header aur backend response check karo.</div>

<div class="scn"><h4>502 aur missing health file</h4><p>Ek team ne /health par custom probe jodha aur ship kiya. Har request par 502 aaya. Gateway theek tha; naya probe path servers par exist hi nahi karta tha (404). App mein health endpoint banane se, gateway badalne se nahi, ek minute mein 200 wapas aaya, aur deployment se pehle probe path verify karne ka release check jod diya gaya.</p><p><b>Lesson:</b> probe gateway aur application ke beech ka contract hai.</p></div>

<div class="iv"><p class="q">"Application Gateway 502 de raha hai. Diagnose kaise karoge?"</p><p>Portal mein ya show-backend-health se backend health dekho. Unhealthy ho to: probe path, port, protocol aur host header, backend settings, gateway subnet se backends tak NSG aur routing, end-to-end TLS ke liye backend certificate, aur app ka response code. Wajah (aam taur par app ya probe) fix karo, gateway nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Gateway ko apna subnet chahiye; yeh creation se hourly bill karta hai.</li>
<li>Core objects: listener, rule, backend settings, pool, probe.</li>
<li>502 aam taur par matlab koi healthy backend nahi.</li>
<li>Show-backend-health pehla diagnostic hai.</li>
<li>Ek ghante ke andar resource group delete karo.</li>
</ul></div>
`}};export{s as default};