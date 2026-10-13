var e=`<svg viewBox="0 0 640 270" role="img" aria-label="Service endpoint versus private endpoint">
<rect x="10" y="10" width="300" height="250" rx="8" fill="#e2e8f0"/><text x="160" y="32" text-anchor="middle" class="svg-ink" font-size="13">Service endpoint</text>
<rect x="30" y="50" width="120" height="50" rx="6" fill="#bbf7d0"/><text x="90" y="80" text-anchor="middle" class="svg-ink" font-size="12">snet-app</text>
<rect x="190" y="130" width="100" height="60" rx="6" fill="#bae6fd"/><text x="240" y="156" text-anchor="middle" class="svg-ink" font-size="12">Storage</text><text x="240" y="174" text-anchor="middle" class="svg-muted" font-size="11">public endpoint</text>
<line x1="150" y1="75" x2="240" y2="130" stroke="#64748b" stroke-width="2"/>
<text x="160" y="225" text-anchor="middle" class="svg-muted" font-size="12">Same public service address, but traffic</text><text x="160" y="243" text-anchor="middle" class="svg-muted" font-size="12">stays on the Azure backbone; subnet identity</text>
<rect x="330" y="10" width="300" height="250" rx="8" fill="#ddd6fe"/><text x="480" y="32" text-anchor="middle" class="svg-ink" font-size="13">Private endpoint</text>
<rect x="350" y="50" width="120" height="50" rx="6" fill="#bbf7d0"/><text x="410" y="80" text-anchor="middle" class="svg-ink" font-size="12">snet-app</text>
<rect x="350" y="130" width="130" height="50" rx="6" fill="#fde68a"/><text x="415" y="152" text-anchor="middle" class="svg-ink" font-size="12">Private endpoint</text><text x="415" y="168" text-anchor="middle" class="svg-muted" font-size="11">10.10.3.5 (NIC)</text>
<rect x="520" y="130" width="100" height="60" rx="6" fill="#bae6fd"/><text x="570" y="156" text-anchor="middle" class="svg-ink" font-size="12">Storage</text><text x="570" y="174" text-anchor="middle" class="svg-muted" font-size="11">via Private Link</text>
<line x1="410" y1="100" x2="410" y2="130" stroke="#64748b" stroke-width="2"/><line x1="480" y1="155" x2="520" y2="160" stroke="#64748b" stroke-width="2"/>
<text x="480" y="225" text-anchor="middle" class="svg-muted" font-size="12">Service gets a private IP in your subnet.</text><text x="480" y="243" text-anchor="middle" class="svg-muted" font-size="12">Needs private DNS to resolve to it.</text>
</svg>`,t={id:`endpoints-private-link-dns`,h:{en:`Service endpoints, private endpoints and DNS in a VNet`,hi:`Service endpoints, private endpoints aur VNet mein DNS`},body:{en:`
<h3>The problem: PaaS services have public addresses</h3>
<p>A storage account or a SQL database is a managed service. By default you reach it through a public endpoint, such as a name ending in <code>blob.core.windows.net</code>. Your VM is inside a private VNet, and you want that traffic to stay off the Internet and be restricted to your network. Azure offers two answers. This chapter introduces both at concept level; the full security story belongs to later modules.</p>

<h3>Service endpoints</h3>
<p>A <b>service endpoint</b> is enabled on a <b>subnet</b> for a service type, such as <code>Microsoft.Storage</code>. After that:</p>
<ul>
<li>Traffic from the subnet to that service type travels on the Azure backbone, using an extra system route (next hop type VirtualNetworkServiceEndpoint).</li>
<li>The service sees the subnet identity, so you can add a firewall rule on the storage account that allows only that subnet.</li>
<li>The service still has its <b>public IP</b>. The VM still resolves the public name. It is a shortcut and a filter, not a private address.</li>
<li>It is free (verify before publishing) and simple, but does not reach from on-premises, and it is regional for most services.</li>
</ul>
<pre class="code">az network vnet subnet update -g rg-nk-lab --vnet-name vnet-nk -n snet-app --service-endpoints Microsoft.Storage</pre>

<h3>Private endpoints and Private Link</h3>
<p>A <b>private endpoint</b> is a network interface inside your subnet with a <b>private IP</b> that maps to one specific instance of a service, such as one storage account. The technology behind it is <b>Azure Private Link</b>.</p>
<ul>
<li>The service is reachable at 10.10.3.5, an address from your own range, so you can disable the public endpoint completely.</li>
<li>It works from peered VNets and from on-premises over VPN or ExpressRoute.</li>
<li>It is billed per hour plus data processed (verify before publishing), so it is not free.</li>
<li>It needs the right <b>DNS</b>: the service name must resolve to the private IP.</li>
</ul>

<div class="dia">`+e+`<p class="cap">Service endpoint: shortcut and filter to a public service. Private endpoint: the service gets a private IP in your subnet.</p></div>

<table class="cmp"><tr><th>Question</th><th>Service endpoint</th><th>Private endpoint</th></tr>
<tr><td>IP the service is reached on</td><td>Public</td><td>Private, in your subnet</td></tr>
<tr><td>Scope</td><td>All instances of the service type</td><td>One specific resource</td></tr>
<tr><td>From on-premises</td><td>No</td><td>Yes (VPN or ExpressRoute)</td></tr>
<tr><td>Public access can be closed</td><td>Restricted to subnets</td><td>Can be fully disabled</td></tr>
<tr><td>Cost</td><td>Free (verify)</td><td>Hourly plus data (verify)</td></tr>
<tr><td>DNS change needed</td><td>No</td><td>Yes</td></tr>
</table>
<div class="note"><p><b>AWS vs Azure.</b> A service endpoint resembles an AWS gateway endpoint. A private endpoint resembles an AWS interface endpoint (PrivateLink).</p></div>

<h3>DNS inside a VNet</h3>
<p>By default a VNet uses <b>Azure-provided DNS</b>, reached at the virtual IP <code>168.63.129.16</code>. It resolves public names and gives VMs in the same VNet internal names (for example the VM name with an internal suffix; verify exact form). You can instead set <b>custom DNS servers</b> on the VNet, for example your domain controllers, and VMs pick them up at the next DHCP renewal or restart.</p>
<p>For private endpoints you create a <b>private DNS zone</b>, such as <code>privatelink.blob.core.windows.net</code> (verify zone name per service), and <b>link</b> it to the VNet. The public name then has a CNAME to the privatelink name, which resolves to 10.10.3.5 inside the VNet but to the public IP outside.</p>
<pre class="code"><span class="c"># from a VM in the VNet, after a private endpoint and private DNS zone exist</span>
nslookup stnklab123.blob.core.windows.net</pre>
<p>Illustrative output:</p>
<pre class="out">Server:   168.63.129.16
Address:  168.63.129.16#53

Non-authoritative answer:
stnklab123.blob.core.windows.net  canonical name = stnklab123.privatelink.blob.core.windows.net.
Name:     stnklab123.privatelink.blob.core.windows.net
Address:  <span class="hl">10.10.3.5</span></pre>
<p>If you see a public address here, the private DNS zone link is missing, or the VM uses a custom DNS server that does not forward to Azure DNS.</p>

<div class="eg"><p><b>Worked example.</b> Asha keeps lab files in a storage account. Option A: she enables a Microsoft.Storage service endpoint on snet-app and adds the subnet to the storage firewall. Traffic stays on the backbone; the name still resolves to a public IP. Option B: she creates a private endpoint in 10.10.3.0/24, links a private DNS zone, and disables public network access. Now only her VNet and peered networks can reach the account.</p></div>

<div class="warn"><p><b>Common mistake.</b> Creating a private endpoint and leaving public access open and DNS unlinked: the VM still goes to the public address, and you pay for an endpoint that protects nothing. Always test with nslookup and a connection test.</p></div>

<div class="exam"><p><b>Exam trap.</b> Service endpoints keep the public IP and extend your subnet identity to the service. Private endpoints give a private IP and work from on-premises. 168.63.129.16 is the Azure virtual public IP used for DNS and for platform health probes.</p></div>

<div class="scn"><h4>Private endpoint, public answer</h4><p>A team built a private endpoint for their database but the application still failed when the database firewall blocked public access. nslookup from the app VM returned a public IP. Their VNet used a custom DNS server that forwarded everything to the Internet. They added a conditional forwarder for the privatelink zone to Azure DNS (168.63.129.16), and the name resolved privately.</p><p><b>Lesson:</b> private endpoints are half networking, half DNS.</p></div>

<div class="iv"><p class="q">"Service endpoint or private endpoint: how do you choose?"</p><p>Service endpoint when you only need a free, simple restriction to a subnet and public IP use is acceptable. Private endpoint when the service must have a private IP, be reachable from on-premises or when public access must be fully closed. Mention DNS for private endpoints.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Service endpoints enable backbone path and subnet-based firewall rules; the service keeps its public IP.</li>
<li>Private endpoints give the service a private IP in your subnet via Private Link.</li>
<li>Private endpoints need private DNS zones linked to the VNet.</li>
<li>Azure-provided DNS lives at 168.63.129.16; custom DNS must forward to it.</li>
<li>Check both pricing and DNS before choosing.</li>
</ul></div>
`,hi:`
<h3>Problem: PaaS services ke public addresses hote hain</h3>
<p>Storage account ya SQL database managed service hai. Default mein aap use public endpoint se reach karte ho, jaise <code>blob.core.windows.net</code> par khatam hone wala naam. Aapka VM private VNet ke andar hai, aur aap chahte ho ki woh traffic Internet se bahar rahe aur aapke network tak restricted ho. Azure do jawab deta hai. Yeh chapter dono ko concept level par introduce karta hai; poori security kahani baad ke modules ki hai.</p>

<h3>Service endpoints</h3>
<p><b>Service endpoint</b> ek <b>subnet</b> par ek service type ke liye enable hota hai, jaise <code>Microsoft.Storage</code>. Uske baad:</p>
<ul>
<li>Subnet se us service type tak traffic Azure backbone par chalta hai, ek extra system route ke saath (next hop type VirtualNetworkServiceEndpoint).</li>
<li>Service ko subnet identity dikhti hai, isliye aap storage account par aisa firewall rule laga sakte ho jo sirf wahi subnet allow kare.</li>
<li>Service ka <b>public IP</b> phir bhi rehta hai. VM phir bhi public naam resolve karta hai. Yeh shortcut aur filter hai, private address nahi.</li>
<li>Yeh free (verify before publishing) aur simple hai, lekin on-premises se kaam nahi karta, aur zyadatar services ke liye regional hai.</li>
</ul>
<pre class="code">az network vnet subnet update -g rg-nk-lab --vnet-name vnet-nk -n snet-app --service-endpoints Microsoft.Storage</pre>

<h3>Private endpoints aur Private Link</h3>
<p><b>Private endpoint</b> aapke subnet ke andar ek network interface hai jiska <b>private IP</b> kisi service ke ek specific instance se map hota hai, jaise ek storage account. Iske peeche ki technology <b>Azure Private Link</b> hai.</p>
<ul>
<li>Service 10.10.3.5 par reachable hoti hai, jo aapki apni range ka address hai, isliye aap public endpoint poori tarah disable kar sakte ho.</li>
<li>Yeh peered VNets se aur VPN ya ExpressRoute ke zariye on-premises se kaam karta hai.</li>
<li>Yeh hourly plus data processed ke hisaab se bill hota hai (verify before publishing), isliye free nahi hai.</li>
<li>Iske liye sahi <b>DNS</b> chahiye: service ka naam private IP par resolve hona chahiye.</li>
</ul>

<div class="dia">`+e+`<p class="cap">Service endpoint: public service ka shortcut aur filter. Private endpoint: service ko aapke subnet mein private IP milta hai.</p></div>

<table class="cmp"><tr><th>Sawal</th><th>Service endpoint</th><th>Private endpoint</th></tr>
<tr><td>Service kis IP par reach hoti hai</td><td>Public</td><td>Private, aapke subnet mein</td></tr>
<tr><td>Scope</td><td>Service type ke saare instances</td><td>Ek specific resource</td></tr>
<tr><td>On-premises se</td><td>Nahi</td><td>Haan (VPN ya ExpressRoute)</td></tr>
<tr><td>Public access band kar sakte hain</td><td>Subnets tak restricted</td><td>Poori tarah disable ho sakta hai</td></tr>
<tr><td>Cost</td><td>Free (verify)</td><td>Hourly plus data (verify)</td></tr>
<tr><td>DNS change chahiye</td><td>Nahi</td><td>Haan</td></tr>
</table>
<div class="note"><p><b>AWS vs Azure.</b> Service endpoint AWS ke gateway endpoint jaisa hai. Private endpoint AWS ke interface endpoint (PrivateLink) jaisa hai.</p></div>

<h3>VNet ke andar DNS</h3>
<p>Default mein VNet <b>Azure-provided DNS</b> use karta hai, jo virtual IP <code>168.63.129.16</code> par milta hai. Woh public names resolve karta hai aur same VNet ke VMs ko internal names deta hai (jaise VM ka naam internal suffix ke saath; exact form verify karo). Aap VNet par <b>custom DNS servers</b> bhi set kar sakte ho, jaise apne domain controllers, aur VMs agle DHCP renewal ya restart par unhe utha lete hain.</p>
<p>Private endpoints ke liye aap <b>private DNS zone</b> banate ho, jaise <code>privatelink.blob.core.windows.net</code> (zone name per service verify karo), aur use VNet se <b>link</b> karte ho. Public naam ka CNAME privatelink naam par jata hai, jo VNet ke andar 10.10.3.5 par resolve hota hai lekin bahar public IP par.</p>
<pre class="code"><span class="c"># VNet ke VM se, private endpoint aur private DNS zone ke baad</span>
nslookup stnklab123.blob.core.windows.net</pre>
<p>Illustrative output:</p>
<pre class="out">Server:   168.63.129.16
Address:  168.63.129.16#53

Non-authoritative answer:
stnklab123.blob.core.windows.net  canonical name = stnklab123.privatelink.blob.core.windows.net.
Name:     stnklab123.privatelink.blob.core.windows.net
Address:  <span class="hl">10.10.3.5</span></pre>
<p>Agar yahan public address dikhe to private DNS zone link missing hai, ya VM aise custom DNS server ko use kar raha hai jo Azure DNS ko forward nahi karta.</p>

<div class="eg"><p><b>Worked example.</b> Asha lab files storage account mein rakhti hai. Option A: woh snet-app par Microsoft.Storage service endpoint enable karti hai aur subnet ko storage firewall mein add karti hai. Traffic backbone par rehta hai; naam phir bhi public IP par resolve hota hai. Option B: woh 10.10.3.0/24 mein private endpoint banati hai, private DNS zone link karti hai, aur public network access disable karti hai. Ab sirf uska VNet aur peered networks account tak pahunch sakte hain.</p></div>

<div class="warn"><p><b>Common mistake.</b> Private endpoint bana kar public access open aur DNS unlinked chhod dena: VM phir bhi public address par jata hai, aur aap aise endpoint ke paise dete ho jo kuch protect nahi karta. Hamesha nslookup aur connection test se check karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Service endpoints public IP rakhte hain aur aapki subnet identity ko service tak badhate hain. Private endpoints private IP dete hain aur on-premises se kaam karte hain. 168.63.129.16 Azure ka virtual public IP hai jo DNS aur platform health probes ke liye use hota hai.</p></div>

<div class="scn"><h4>Private endpoint, public jawab</h4><p>Ek team ne database ke liye private endpoint banaya, lekin jab database firewall ne public access block kiya to application phir bhi fail hui. App VM se nslookup public IP laya. Unke VNet mein custom DNS server tha jo sab kuch Internet ko forward karta tha. Unhone privatelink zone ke liye Azure DNS (168.63.129.16) ko conditional forwarder add kiya, aur naam private tareeke se resolve hua.</p><p><b>Lesson:</b> private endpoints aadhe networking hain, aadhe DNS.</p></div>

<div class="iv"><p class="q">"Service endpoint ya private endpoint: kaise chunte ho?"</p><p>Service endpoint tab jab sirf subnet tak free, simple restriction chahiye aur public IP use acceptable hai. Private endpoint tab jab service ko private IP chahiye, on-premises se reachable honi chahiye ya public access poori tarah band karna ho. Private endpoints ke liye DNS ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Service endpoints backbone path aur subnet-based firewall rules dete hain; service apna public IP rakhti hai.</li>
<li>Private endpoints Private Link se service ko aapke subnet mein private IP dete hain.</li>
<li>Private endpoints ko VNet se linked private DNS zones chahiye.</li>
<li>Azure-provided DNS 168.63.129.16 par hai; custom DNS ko usko forward karna chahiye.</li>
<li>Chunne se pehle pricing aur DNS dono dekho.</li>
</ul></div>
`}};export{t as default};