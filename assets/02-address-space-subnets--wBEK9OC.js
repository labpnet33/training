var e=`<svg viewBox="0 0 640 200" role="img" aria-label="The five reserved addresses in a /24 subnet">
<text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="14">snet-web 10.10.1.0/24 (256 addresses)</text>
<rect x="10" y="40" width="80" height="60" rx="6" fill="#fed7aa"/><text x="50" y="65" text-anchor="middle" class="svg-ink" font-size="12">10.10.1.0</text><text x="50" y="85" text-anchor="middle" class="svg-muted" font-size="11">network</text>
<rect x="95" y="40" width="80" height="60" rx="6" fill="#fed7aa"/><text x="135" y="65" text-anchor="middle" class="svg-ink" font-size="12">10.10.1.1</text><text x="135" y="85" text-anchor="middle" class="svg-muted" font-size="11">gateway</text>
<rect x="180" y="40" width="80" height="60" rx="6" fill="#fed7aa"/><text x="220" y="65" text-anchor="middle" class="svg-ink" font-size="12">10.10.1.2</text><text x="220" y="85" text-anchor="middle" class="svg-muted" font-size="11">Azure DNS</text>
<rect x="265" y="40" width="80" height="60" rx="6" fill="#fed7aa"/><text x="305" y="65" text-anchor="middle" class="svg-ink" font-size="12">10.10.1.3</text><text x="305" y="85" text-anchor="middle" class="svg-muted" font-size="11">Azure DNS</text>
<rect x="350" y="40" width="190" height="60" rx="6" fill="#bbf7d0"/><text x="445" y="65" text-anchor="middle" class="svg-ink" font-size="12">10.10.1.4 to 10.10.1.254</text><text x="445" y="85" text-anchor="middle" class="svg-muted" font-size="11">251 usable (with .255 reserved too)</text>
<rect x="545" y="40" width="85" height="60" rx="6" fill="#fed7aa"/><text x="587" y="65" text-anchor="middle" class="svg-ink" font-size="12">10.10.1.255</text><text x="587" y="85" text-anchor="middle" class="svg-muted" font-size="11">broadcast</text>
<text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="12">5 reserved: .0 .1 .2 .3 and last. Usable range is .4 to .254, which is 251 addresses.</text>
<text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">Smallest subnet /29 = 8 addresses, 3 usable</text>
</svg>`,t={id:`address-space-subnets`,h:{en:`Address space, subnets and the five reserved addresses`,hi:`Address space, subnets aur paanch reserved addresses`},body:{en:`
<h3>Start from the IP address, not the portal</h3>
<p>The portal asks for names and ranges. You will make fewer mistakes if you first know what Azure does with the numbers.</p>

<h3>Address space</h3>
<p>A VNet has one or more <b>address prefixes</b>, written as CIDR, for example 10.10.0.0/16. Rules to remember:</p>
<ul>
<li>Use private ranges (RFC1918): 10.0.0.0/8, 172.16.0.0/12 and 192.168.0.0/16. Azure also lets you use public ranges you own, but that is rare and risky.</li>
<li>Some ranges are not allowed: multicast 224.0.0.0/4, broadcast 255.255.255.255/32, loopback 127.0.0.0/8, link local 169.254.0.0/16, and 168.63.129.16/32 which is Azure's own DNS and health probe address (verify the current list before publishing).</li>
<li>You can <b>add</b> a prefix to an existing VNet. If the VNet is peered, check the peering needs a resync after changes (verify before publishing).</li>
<li>Prefixes in one VNet cannot overlap. Peered or connected networks must not overlap either.</li>
<li>Size: a VNet can be as large as /2 and as small as /29 (verify limits).</li>
</ul>

<h3>Subnets</h3>
<p>A <b>subnet</b> is a range carved out of the VNet space. Resources get their private IP from the subnet. Subnet rules:</p>
<ul>
<li>It must fit inside a VNet prefix and not overlap another subnet.</li>
<li>The smallest is /29, the largest is the whole VNet space.</li>
<li>It is regional, not tied to a zone.</li>
<li>Some services need a subnet with a specific name: <code>GatewaySubnet</code> (VPN or ExpressRoute gateway), <code>AzureBastionSubnet</code>, <code>AzureFirewallSubnet</code>. Others need a <b>delegated</b> subnet dedicated to that service (for example some PaaS integrations). Sizes needed vary; check the service page.</li>
<li>Resizing is awkward. A subnet with resources in it generally cannot be resized, so leave room.</li>
</ul>

<h3>The five reserved addresses</h3>
<p>In every subnet, Azure reserves five addresses: the <b>network</b> address (.0), the <b>default gateway</b> (.1), two addresses for <b>Azure DNS mapping</b> (.2 and .3) and the <b>broadcast</b> address (the last one). So a /24 has 256 minus 5 = <b>251</b> usable addresses, and the first one you can use is .4.</p>

<div class="dia">`+e+`<p class="cap">Five reserved addresses per subnet. The first usable address is .4.</p></div>

<table class="cmp"><tr><th>Subnet</th><th>Total</th><th>Usable</th></tr>
<tr><td>/24</td><td>256</td><td>251</td></tr>
<tr><td>/26</td><td>64</td><td>59</td></tr>
<tr><td>/27</td><td>32</td><td>27</td></tr>
<tr><td>/28</td><td>16</td><td>11</td></tr>
<tr><td>/29</td><td>8</td><td>3</td></tr>
</table>

<h3>Private IP assignment</h3>
<p>A NIC gets a private IP from the subnet. It is <b>dynamic</b> by default: the address stays with the NIC for as long as the NIC exists, even if the VM is stopped (deallocated), but Azure may give a different one if the NIC is deleted. You can make it <b>static</b> for servers that need a fixed address. A static choice is still configured in Azure, not inside the guest OS: do not hand-edit the IP in the VM's network settings.</p>

<h3>Config and verification</h3>
<pre class="code">az network vnet create -g rg-nk-lab -n vnet-nk --address-prefixes 10.10.0.0/16 --subnet-name snet-web --subnet-prefixes 10.10.1.0/24
az network vnet subnet create -g rg-nk-lab --vnet-name vnet-nk -n snet-app --address-prefixes 10.10.2.0/24
<span class="c"># add a second address prefix later</span>
az network vnet update -g rg-nk-lab -n vnet-nk --address-prefixes 10.10.0.0/16 10.11.0.0/16
az network vnet subnet show -g rg-nk-lab --vnet-name vnet-nk -n snet-web --query "{name:name, prefix:addressPrefix}"</pre>
<p>Illustrative output of the list:</p>
<pre class="out">Name      AddressPrefix
--------  -------------
snet-web  <span class="hl">10.10.1.0/24</span>
snet-app  10.10.2.0/24</pre>

<div class="eg"><p><b>Worked example.</b> A team needs 40 VMs plus room to grow in a subnet. A /26 gives only 59 usable, and with 40 used there is little room for scale sets. They choose a /24 (251 usable). For the VPN gateway later they leave 10.10.255.0/27 free for GatewaySubnet.</p></div>

<div class="warn"><p><b>Common mistake.</b> Making subnets too small "to save addresses". Private addresses are free; resizing a subnet that holds resources is painful. Another mistake: planning a /29 for a service that needs more.</p></div>

<div class="exam"><p><b>Exam trap.</b> AWS reserves five addresses too, but the meaning differs: AWS has network, VPC router, DNS, future use and broadcast. Azure has network, default gateway, two DNS, broadcast. Both give a /24 251 usable addresses.</p></div>

<div class="scn"><h4>Subnet full on release day</h4><p>A scale set in a /26 subnet stopped scaling at 59 instances during a sale. New VMs failed with a subnet-full style error. The team added a new /24 subnet and moved the scale set during a maintenance window. The post-incident rule: production subnets are /24 unless a reason is written down.</p><p><b>Lesson:</b> subnet size is a capacity decision. Plan for scale and for services that consume addresses.</p></div>

<div class="iv"><p class="q">"How many hosts can a /27 subnet hold in Azure?"</p><p>32 total minus 5 reserved is 27. State the five reserved addresses, because the follow-up is usually why.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VNet address space is RFC1918 CIDR; prefixes can be added later.</li>
<li>Subnets are carved from it, cannot overlap, and are regional.</li>
<li>Five addresses are reserved per subnet; the first usable is .4.</li>
<li>/29 is the smallest subnet; /24 gives 251 usable.</li>
<li>Gateway, Bastion and Firewall subnets have required names.</li>
</ul></div>
`,hi:`
<h3>Portal se nahi, IP address se shuru karo</h3>
<p>Portal naam aur ranges maangta hai. Pehle yeh jaan loge ki Azure numbers ke saath kya karta hai to galtiyan kam hongi.</p>

<h3>Address space</h3>
<p>VNet ke ek ya zyada <b>address prefixes</b> hote hain, CIDR mein likhe, jaise 10.10.0.0/16. Yaad rakhne ke rules:</p>
<ul>
<li>Private ranges (RFC1918) use karo: 10.0.0.0/8, 172.16.0.0/12 aur 192.168.0.0/16. Azure aapko apni public ranges bhi use karne deta hai, lekin yeh rare aur risky hai.</li>
<li>Kuch ranges allowed nahi: multicast 224.0.0.0/4, broadcast 255.255.255.255/32, loopback 127.0.0.0/8, link local 169.254.0.0/16, aur 168.63.129.16/32 jo Azure ka apna DNS aur health probe address hai (current list publish karne se pehle verify karo).</li>
<li>Maujooda VNet mein prefix <b>add</b> kar sakte ho. Agar VNet peered hai to dekho ki changes ke baad peering ko resync chahiye ya nahi (verify before publishing).</li>
<li>Ek VNet ke prefixes overlap nahi kar sakte. Peered ya connected networks bhi overlap nahi kar sakte.</li>
<li>Size: VNet /2 tak bada aur /29 tak chhota ho sakta hai (limits verify karo).</li>
</ul>

<h3>Subnets</h3>
<p><b>Subnet</b> VNet space se kata hua ek range hai. Resources ko apna private IP subnet se milta hai. Subnet rules:</p>
<ul>
<li>Woh VNet prefix ke andar fit hona chahiye aur doosre subnet se overlap nahi.</li>
<li>Sabse chhota /29 hai, sabse bada poora VNet space.</li>
<li>Woh regional hai, kisi zone se bandha nahi.</li>
<li>Kuch services ko specific naam wala subnet chahiye: <code>GatewaySubnet</code> (VPN ya ExpressRoute gateway), <code>AzureBastionSubnet</code>, <code>AzureFirewallSubnet</code>. Doosri services ko us service ke liye dedicated <b>delegated</b> subnet chahiye (jaise kuch PaaS integrations). Zaroori sizes alag hote hain; service ka page check karo.</li>
<li>Resize karna mushkil hai. Jis subnet mein resources hain use aam taur par resize nahi kar sakte, isliye jagah chhodo.</li>
</ul>

<h3>Paanch reserved addresses</h3>
<p>Har subnet mein Azure paanch addresses reserve karta hai: <b>network</b> address (.0), <b>default gateway</b> (.1), <b>Azure DNS mapping</b> ke do addresses (.2 aur .3) aur <b>broadcast</b> address (aakhri wala). To /24 mein 256 minus 5 = <b>251</b> usable addresses hote hain, aur pehla jo use kar sakte ho woh .4 hai.</p>

<div class="dia">`+e+`<p class="cap">Har subnet mein paanch reserved addresses. Pehla usable address .4 hai.</p></div>

<table class="cmp"><tr><th>Subnet</th><th>Total</th><th>Usable</th></tr>
<tr><td>/24</td><td>256</td><td>251</td></tr>
<tr><td>/26</td><td>64</td><td>59</td></tr>
<tr><td>/27</td><td>32</td><td>27</td></tr>
<tr><td>/28</td><td>16</td><td>11</td></tr>
<tr><td>/29</td><td>8</td><td>3</td></tr>
</table>

<h3>Private IP assignment</h3>
<p>NIC ko subnet se private IP milta hai. Default mein woh <b>dynamic</b> hota hai: jab tak NIC exist karta hai address uske saath rehta hai, VM stopped (deallocated) ho tab bhi, lekin NIC delete hone par Azure alag de sakta hai. Fixed address chahiye wale servers ke liye use <b>static</b> bana sakte ho. Static choice bhi Azure mein configure hoti hai, guest OS ke andar nahi: VM ki network settings mein IP haath se edit mat karo.</p>

<h3>Config aur verification</h3>
<pre class="code">az network vnet create -g rg-nk-lab -n vnet-nk --address-prefixes 10.10.0.0/16 --subnet-name snet-web --subnet-prefixes 10.10.1.0/24
az network vnet subnet create -g rg-nk-lab --vnet-name vnet-nk -n snet-app --address-prefixes 10.10.2.0/24
<span class="c"># baad mein doosra address prefix add karo</span>
az network vnet update -g rg-nk-lab -n vnet-nk --address-prefixes 10.10.0.0/16 10.11.0.0/16
az network vnet subnet show -g rg-nk-lab --vnet-name vnet-nk -n snet-web --query "{name:name, prefix:addressPrefix}"</pre>
<p>List ka illustrative output:</p>
<pre class="out">Name      AddressPrefix
--------  -------------
snet-web  <span class="hl">10.10.1.0/24</span>
snet-app  10.10.2.0/24</pre>

<div class="eg"><p><b>Worked example.</b> Ek team ko subnet mein 40 VMs aur growth ke liye jagah chahiye. /26 sirf 59 usable deta hai, aur 40 use hone par scale sets ke liye kam jagah bachti hai. Woh /24 (251 usable) chunte hain. Baad mein VPN gateway ke liye woh GatewaySubnet ke liye 10.10.255.0/27 free chhodte hain.</p></div>

<div class="warn"><p><b>Common mistake.</b> "Addresses bachane" ke liye subnets bahut chhote banana. Private addresses free hain; resources wale subnet ko resize karna dardnaak hai. Ek aur galti: aisi service ke liye /29 plan karna jise zyada chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> AWS bhi paanch addresses reserve karta hai, lekin matlab alag hai: AWS mein network, VPC router, DNS, future use aur broadcast. Azure mein network, default gateway, do DNS, broadcast. Dono /24 ko 251 usable dete hain.</p></div>

<div class="scn"><h4>Release ke din subnet full</h4><p>/26 subnet mein scale set sale ke dauran 59 instances par scale hona band ho gaya. Naye VMs subnet-full jaise error se fail hue. Team ne naya /24 subnet add kiya aur maintenance window mein scale set move kiya. Post-incident rule: production subnets /24 honge jab tak likhit karan na ho.</p><p><b>Lesson:</b> subnet size capacity ka faisla hai. Scale aur address kharch karne wali services ke liye plan karo.</p></div>

<div class="iv"><p class="q">"Azure mein /27 subnet mein kitne hosts aa sakte hain?"</p><p>32 total minus 5 reserved yaani 27. Paanch reserved addresses batao, kyunki follow-up aam taur par kyun hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VNet address space RFC1918 CIDR hai; prefixes baad mein add ho sakte hain.</li>
<li>Subnets usi se kate jaate hain, overlap nahi kar sakte, aur regional hain.</li>
<li>Har subnet mein paanch addresses reserved; pehla usable .4.</li>
<li>/29 sabse chhota subnet; /24 mein 251 usable.</li>
<li>Gateway, Bastion aur Firewall subnets ke required naam hote hain.</li>
</ul></div>
`}};export{t as default};