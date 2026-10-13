var e={id:`sdwan-in-public-clouds`,h:{en:`SD-WAN in AWS, Azure and Google Cloud: FortiGate-VM, transit attachments, GRE, IPsec and BGP`,hi:`AWS, Azure aur Google Cloud mein SD-WAN: FortiGate-VM, transit attachments, GRE, IPsec aur BGP`},body:{en:`
<p>To reach workloads in a public cloud with the same visibility and security as a branch, you put a <b>FortiGate-VM</b> in the cloud network and make it part of the SD-WAN overlay. The FortiGate-VM runs the same FortiOS as the hardware, so the IPsec, BGP, SD-WAN rule and security features are the same. What differs is how the cloud's own network (VPC, VNet, transit gateway, virtual WAN) connects to it. This chapter explains the common patterns at a conceptual level and gives the FortiGate-side GRE and BGP configuration for AWS Transit Gateway Connect.</p>
<h3>Pattern 1: FortiGate-VM as a spoke or hub in a security VPC or VNet</h3>
<p>The simplest design copies the branch design. CLOUD1-FGT is deployed in a dedicated security VPC (AWS), VNet (Azure) or VPC (Google Cloud). It has a public interface for the IPsec tunnels, an inside interface towards the workloads, and it joins the overlay as a spoke of HUB1-FGT, or as a hub for the other regions. The workload subnets use route tables that point their default route or the branch prefixes to the FortiGate-VM's inside interface. Everything from the SD-WAN modules applies: IPsec phase 1 with the same IDs, BGP over the overlay (the routing module), SLAs, ADVPN and security profiles.</p>
<h3>Pattern 2: the cloud transit service as the routing hub</h3>
<p>Large clouds have a managed transit service that connects many networks. Fortinet documents integrations with all three big public clouds:</p>
<table class="cmp"><tr><th>Cloud</th><th>Transit service</th><th>How the FortiGate connects</th><th>Notes from the documentation</th></tr><tr><td><b>AWS</b></td><td>Transit Gateway with a <b>Connect</b> attachment</td><td>A GRE tunnel from the FortiGate-VM to the transit gateway, with BGP over the GRE tunnel</td><td>Up to 5 Gbit/s per GRE tunnel and up to 4 Connect peers per attachment, which gives about 20 Gbit/s per attachment. The transit gateway ASN is 64512 by default. FortiGates in two availability zones run active-passive.</td></tr><tr><td><b>Azure</b></td><td>Virtual WAN, with the FortiGate as a network virtual appliance (NVA) in the hub</td><td>The NVA in the vWAN hub forms the SD-WAN overlay with the branch FortiGates; FortiManager provisions it with an SD-WAN overlay template</td><td>The deployment guide uses two primary hubs for redundancy, not a primary and a secondary. The BGP ASN in the template must equal the ASN on the hub NVAs.</td></tr><tr><td><b>Google Cloud</b></td><td>Network Connectivity Center (NCC)</td><td>FortiGate-VM is a router appliance spoke of an NCC hub, with site-to-site VPN to remote sites and BGP</td><td>The NCC hub belongs to a VPC. One spoke is created per remote site, in the region closest to that site, to reduce latency.</td></tr></table>
<h3>AWS Transit Gateway Connect on the FortiGate</h3>
<p>A Connect attachment uses GRE tunnels between the transit gateway and an appliance in a VPC, and BGP runs inside the tunnel. On the FortiGate you need three things: a static route to the transit gateway's tunnel endpoint, a GRE tunnel, and a BGP neighbor on the GRE interface with multihop enabled. The configuration below follows the structure of the AWS blog on Connect with FortiGate. The addresses are documentation stand-ins: 192.0.2.0/24 for the VPC subnet, 198.51.100.0/24 for the transit gateway's tunnel address block, and 169.254.120.0/29 as the tunnel inside range. In AWS the BGP inside range must be a link-local 169.254.x.x block, and the blog notes a mask of /29 or smaller.</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! CLOUD1-FGT in AWS. port2 terminates the GRE tunnel, port1 carries the IPsec to the overlay</span>
config router static
    edit 1
        set dst 198.51.100.0 255.255.255.0
        set gateway 192.0.2.1
        set device "port2"
    next
end
config system gre-tunnel
    edit "tgwc"
        set interface "port2"
        set remote-gw 198.51.100.4
        set local-gw 192.0.2.29
    next
end
config system interface
    edit "tgwc"
        set ip 169.254.120.1 255.255.255.255
        set allowaccess ping
        set remote-ip 169.254.120.2 255.255.255.248
    next
end
config router bgp
    set as 65510
    set router-id 169.254.100.1
    config neighbor
        edit "169.254.120.2"
            set remote-as 64512
            set ebgp-enforce-multihop enable
            set soft-reconfiguration enable
            set capability-default-originate enable
        next
    end
    config network
        edit 1
            set prefix 192.0.2.0 255.255.255.0
        next
    end
end</pre>
<p>Reading the configuration: the static route tells the FortiGate that the transit gateway's tunnel endpoint (198.51.100.4) is reached through the VPC subnet gateway on port2. The GRE tunnel is built between the FortiGate's own address and that endpoint. The tunnel interface gets a /32 and a remote address in the link-local range, which is the BGP peering address pair. The neighbor is an external one (AS 65510 to AS 64512), so <code>ebgp-enforce-multihop</code> is needed because the peer is not directly connected. <code>capability-default-originate</code> makes the FortiGate advertise a default route to that neighbor, as the blog design does; set it only if your design wants the cloud to send internet traffic through the FortiGate. The remote gateway address is unique for each Connect peer, so each FortiGate has its own tunnel configuration. Policies must permit GRE and BGP to the FortiGate and the application traffic through it.</p>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="diagram"><rect x="10" y="95" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="122" text-anchor="middle" class="svg-ink" font-size="12">BR1-FGT</text><text x="65" y="140" text-anchor="middle" class="svg-muted" font-size="11">branch</text><rect x="170" y="95" width="110" height="60" rx="10" fill="#fde68a"/><text x="225" y="122" text-anchor="middle" class="svg-ink" font-size="12">HUB1-FGT</text><text x="225" y="140" text-anchor="middle" class="svg-muted" font-size="11">overlay hub</text><rect x="340" y="40" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="405" y="66" text-anchor="middle" class="svg-ink" font-size="12">CLOUD1-FGT az1</text><text x="405" y="84" text-anchor="middle" class="svg-muted" font-size="11">active</text><rect x="340" y="150" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="405" y="176" text-anchor="middle" class="svg-ink" font-size="12">CLOUD1-FGT az2</text><text x="405" y="194" text-anchor="middle" class="svg-muted" font-size="11">passive</text><rect x="520" y="95" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="575" y="122" text-anchor="middle" class="svg-ink" font-size="12">Transit gateway</text><text x="575" y="140" text-anchor="middle" class="svg-muted" font-size="11">AS 64512</text><line x1="120" y1="125" x2="170" y2="125" stroke="#64748b" stroke-width="2"/><line x1="280" y1="115" x2="340" y2="75" stroke="#64748b" stroke-width="2"/><line x1="280" y1="135" x2="340" y2="180" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><line x1="470" y1="70" x2="520" y2="115" stroke="#64748b" stroke-width="2"/><line x1="470" y1="180" x2="520" y2="140" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="320" y="245" text-anchor="middle" class="svg-muted" font-size="12">IPsec on the left, GRE with BGP on the right</text></svg><p class="cap">The FortiGate-VM joins the overlay with IPsec and the cloud transit with GRE and BGP.</p></div>
<h3>High availability in the cloud</h3>
<p>A cloud network is not an ordinary LAN, so the way a standby takes over differs by platform: the platform's own API is used to move addresses or routes to the surviving FortiGate. The AWS design for Connect uses two FortiGate-VMs in different availability zones in an active-passive arrangement, with redundant GRE and BGP connections, deployed from templates. The administration guide of each cloud describes the exact mechanism, so read the one for your platform before you promise a failover time. A design rule that always holds: each unit must be able to carry <b>the whole load</b> alone.</p>
<h3>Sizing with numbers</h3>
<table class="cmp"><tr><th>Item</th><th>Example</th><th>Check</th></tr><tr><td>Branches sending traffic to the cloud</td><td>40 branches x 20 Mbit/s busy hour = 800 Mbit/s</td><td>The IPsec throughput of one FortiGate-VM must be at least 800 Mbit/s, with headroom of 30 percent for security profiles: plan 1 Gbit/s.</td></tr><tr><td>Transit attachment</td><td>5 Gbit/s per GRE tunnel</td><td>Far above 800 Mbit/s, so not the limit.</td></tr><tr><td>Redundancy</td><td>Two units in two zones</td><td>Each unit alone must carry 800 Mbit/s.</td></tr><tr><td>Cloud instance</td><td>The VM size sets the network bandwidth and the vCPU count</td><td>Read the datasheet figures for your FortiGate-VM size and licence.</td></tr></table>
<div class="warn"><p><b>Common mistake.</b> Forgetting the cloud route tables. The FortiGate-VM can be perfect, but if the workload subnet's route table does not point to it, the return traffic from the workloads goes around it and the sessions break (asymmetric routing).</p></div>
<div class="exam"><p><b>Exam trap.</b> For AWS Transit Gateway Connect, the tunnel is GRE and the routing protocol is BGP; the external BGP peer needs multihop; the transit gateway ASN defaults to 64512 and must differ from the FortiGate's ASN. In Azure vWAN the template ASN must equal the hub NVA ASN.</p></div>
<div class="scn"><h4>The cloud tunnel is up, the application is unreachable</h4><p>CLOUD1-FGT has an established GRE tunnel and the BGP session is up with the transit gateway. The branch pings the FortiGate's inside address but not an application server. The workload subnet route table still points its branch prefixes to the transit gateway's old attachment, not to the FortiGate. The route table change brought the replies back through CLOUD1-FGT.</p><p><b>Lesson:</b> In a cloud, BGP on the FortiGate is half of the routing. The other half is the cloud's route tables.</p></div>
<div class="iv"><p class="q">"How does a FortiGate-VM join an AWS Transit Gateway?"</p><p>Through a Connect attachment. I build a GRE tunnel between the FortiGate and the transit gateway's tunnel endpoint, with a static route to that endpoint, and run external BGP over the tunnel's link-local addresses with multihop enabled. Two FortiGates in two availability zones give redundancy, and each can carry the full load. The cloud route tables must send the right prefixes to the attachment or the FortiGate.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>FortiGate-VM runs the same FortiOS, so the overlay, BGP, SLA and security features carry over.</li><li>AWS: Transit Gateway Connect with GRE and BGP. Azure: FortiGate NVA in vWAN hub. Google Cloud: NCC with a router appliance spoke.</li><li>The GRE setup needs a static route to the endpoint, a tunnel, and eBGP with multihop.</li><li>Cloud HA is platform specific; size every unit for the whole load.</li><li>Cloud route tables are part of the design.</li></ul></div>
`,hi:`
<p>Public cloud ke workloads tak branch jaisi visibility aur security ke saath pahunchne ke liye aap cloud network mein ek <b>FortiGate-VM</b> rakhte ho aur use SD-WAN overlay ka hissa banate ho. FortiGate-VM hardware wala hi FortiOS chalata hai, isliye IPsec, BGP, SD-WAN rule aur security features wahi hain. Farq yeh hai ki cloud ka apna network (VPC, VNet, transit gateway, virtual WAN) usse kaise judta hai. Yeh chapter conceptual level par common patterns samjhata hai aur AWS Transit Gateway Connect ke liye FortiGate-side GRE aur BGP configuration deta hai.</p>
<h3>Pattern 1: security VPC ya VNet mein spoke ya hub ke roop mein FortiGate-VM</h3>
<p>Sabse saral design branch design ki copy hai. CLOUD1-FGT ek dedicated security VPC (AWS), VNet (Azure) ya VPC (Google Cloud) mein deploy hota hai. Uska ek public interface IPsec tunnels ke liye, ek inside interface workloads ki taraf, aur woh HUB1-FGT ke spoke ke roop mein, ya doosre regions ke hub ke roop mein overlay join karta hai. Workload subnets aise route tables use karte hain jo default route ya branch prefixes ko FortiGate-VM ke inside interface ki taraf point karte hain. SD-WAN modules ka sab kuch laagu hota hai: wahi IDs ke saath IPsec phase 1, overlay par BGP (routing module), SLAs, ADVPN aur security profiles.</p>
<h3>Pattern 2: routing hub ke roop mein cloud transit service</h3>
<p>Bade clouds mein managed transit service hoti hai jo kai networks jodti hai. Fortinet teeno bade public clouds ke saath integrations document karta hai:</p>
<table class="cmp"><tr><th>Cloud</th><th>Transit service</th><th>FortiGate kaise judta hai</th><th>Documentation se notes</th></tr><tr><td><b>AWS</b></td><td>Transit Gateway, <b>Connect</b> attachment ke saath</td><td>FortiGate-VM se transit gateway tak GRE tunnel, aur GRE tunnel par BGP</td><td>Har GRE tunnel par 5 Gbit/s tak aur har attachment par 4 Connect peers tak, yaani attachment par lagbhag 20 Gbit/s. Transit gateway ASN default 64512 hai. Do availability zones ke FortiGates active-passive chalte hain.</td></tr><tr><td><b>Azure</b></td><td>Virtual WAN, hub mein network virtual appliance (NVA) ke roop mein FortiGate ke saath</td><td>vWAN hub ka NVA branch FortiGates ke saath SD-WAN overlay banata hai; FortiManager use SD-WAN overlay template se provision karta hai</td><td>Deployment guide redundancy ke liye do primary hubs use karti hai, primary aur secondary nahi. Template ka BGP ASN hub NVAs ke ASN ke barabar hona chahiye.</td></tr><tr><td><b>Google Cloud</b></td><td>Network Connectivity Center (NCC)</td><td>FortiGate-VM NCC hub ka router appliance spoke hai, remote sites ke saath site-to-site VPN aur BGP ke saath</td><td>NCC hub ek VPC ka hota hai. Har remote site ke liye ek spoke banta hai, us site ke sabse paas ke region mein, latency kam karne ke liye.</td></tr></table>
<h3>FortiGate par AWS Transit Gateway Connect</h3>
<p>Connect attachment transit gateway aur VPC ke appliance ke beech GRE tunnels use karta hai, aur BGP tunnel ke andar chalta hai. FortiGate par teen cheezein chahiye: transit gateway ke tunnel endpoint tak static route, ek GRE tunnel, aur GRE interface par multihop enabled BGP neighbor. Neeche ki configuration FortiGate ke saath Connect par AWS blog ke structure ko follow karti hai. Addresses documentation stand-ins hain: VPC subnet ke liye 192.0.2.0/24, transit gateway ke tunnel address block ke liye 198.51.100.0/24, aur tunnel inside range ke liye 169.254.120.0/29. AWS mein BGP inside range link-local 169.254.x.x block hona chahiye, aur blog /29 ya chhota mask batata hai.</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! CLOUD1-FGT in AWS. port2 terminates the GRE tunnel, port1 carries the IPsec to the overlay</span>
config router static
    edit 1
        set dst 198.51.100.0 255.255.255.0
        set gateway 192.0.2.1
        set device "port2"
    next
end
config system gre-tunnel
    edit "tgwc"
        set interface "port2"
        set remote-gw 198.51.100.4
        set local-gw 192.0.2.29
    next
end
config system interface
    edit "tgwc"
        set ip 169.254.120.1 255.255.255.255
        set allowaccess ping
        set remote-ip 169.254.120.2 255.255.255.248
    next
end
config router bgp
    set as 65510
    set router-id 169.254.100.1
    config neighbor
        edit "169.254.120.2"
            set remote-as 64512
            set ebgp-enforce-multihop enable
            set soft-reconfiguration enable
            set capability-default-originate enable
        next
    end
    config network
        edit 1
            set prefix 192.0.2.0 255.255.255.0
        next
    end
end</pre>
<p>Configuration padhna: static route FortiGate ko batata hai ki transit gateway ka tunnel endpoint (198.51.100.4) port2 par VPC subnet gateway ke through milta hai. GRE tunnel FortiGate ke apne address aur us endpoint ke beech banta hai. Tunnel interface ko /32 aur link-local range ka remote address milta hai, jo BGP peering address jodi hai. Neighbor external hai (AS 65510 se AS 64512), isliye <code>ebgp-enforce-multihop</code> chahiye kyunki peer directly connected nahi hai. <code>capability-default-originate</code> FortiGate ko us neighbor ko default route advertise karne deta hai, jaise blog design mein; ise tabhi set karo jab design chahe ki cloud internet traffic FortiGate se bheje. Remote gateway address har Connect peer ke liye unique hai, isliye har FortiGate ki apni tunnel configuration hoti hai. Policies ko FortiGate tak GRE aur BGP aur uske through application traffic permit karna hoga.</p>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="diagram"><rect x="10" y="95" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="122" text-anchor="middle" class="svg-ink" font-size="12">BR1-FGT</text><text x="65" y="140" text-anchor="middle" class="svg-muted" font-size="11">branch</text><rect x="170" y="95" width="110" height="60" rx="10" fill="#fde68a"/><text x="225" y="122" text-anchor="middle" class="svg-ink" font-size="12">HUB1-FGT</text><text x="225" y="140" text-anchor="middle" class="svg-muted" font-size="11">overlay hub</text><rect x="340" y="40" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="405" y="66" text-anchor="middle" class="svg-ink" font-size="12">CLOUD1-FGT az1</text><text x="405" y="84" text-anchor="middle" class="svg-muted" font-size="11">active</text><rect x="340" y="150" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="405" y="176" text-anchor="middle" class="svg-ink" font-size="12">CLOUD1-FGT az2</text><text x="405" y="194" text-anchor="middle" class="svg-muted" font-size="11">passive</text><rect x="520" y="95" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="575" y="122" text-anchor="middle" class="svg-ink" font-size="12">Transit gateway</text><text x="575" y="140" text-anchor="middle" class="svg-muted" font-size="11">AS 64512</text><line x1="120" y1="125" x2="170" y2="125" stroke="#64748b" stroke-width="2"/><line x1="280" y1="115" x2="340" y2="75" stroke="#64748b" stroke-width="2"/><line x1="280" y1="135" x2="340" y2="180" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><line x1="470" y1="70" x2="520" y2="115" stroke="#64748b" stroke-width="2"/><line x1="470" y1="180" x2="520" y2="140" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="320" y="245" text-anchor="middle" class="svg-muted" font-size="12">Left mein IPsec, right mein GRE aur BGP</text></svg><p class="cap">FortiGate-VM overlay se IPsec se aur cloud transit se GRE aur BGP se judta hai.</p></div>
<h3>Cloud mein high availability</h3>
<p>Cloud network aam LAN nahi hai, isliye standby kaise sambhalta hai woh platform ke hisaab se alag hai: bachi hui FortiGate ki taraf addresses ya routes move karne ke liye platform ki apni API use hoti hai. Connect ke liye AWS design alag availability zones mein do FortiGate-VMs active-passive arrangement mein use karta hai, redundant GRE aur BGP connections ke saath, templates se deploy. Har cloud ki administration guide exact mechanism batati hai, isliye failover time ka vaada karne se pehle apne platform ki guide padho. Ek design rule hamesha sahi: har unit <b>poora load</b> akela utha sake.</p>
<h3>Numbers ke saath sizing</h3>
<table class="cmp"><tr><th>Item</th><th>Example</th><th>Check</th></tr><tr><td>Cloud ko traffic bhejne wali branches</td><td>40 branches x 20 Mbit/s busy hour = 800 Mbit/s</td><td>Ek FortiGate-VM ka IPsec throughput kam se kam 800 Mbit/s ho, security profiles ke liye 30 percent headroom ke saath: 1 Gbit/s plan karo.</td></tr><tr><td>Transit attachment</td><td>Har GRE tunnel 5 Gbit/s</td><td>800 Mbit/s se bahut upar, isliye limit nahi.</td></tr><tr><td>Redundancy</td><td>Do zones mein do units</td><td>Har unit akela 800 Mbit/s utha sake.</td></tr><tr><td>Cloud instance</td><td>VM size network bandwidth aur vCPU count tay karta hai</td><td>Apne FortiGate-VM size aur licence ke datasheet figures padho.</td></tr></table>
<div class="warn"><p><b>Common galti.</b> Cloud route tables bhool jaana. FortiGate-VM perfect ho sakta hai, par agar workload subnet ka route table use point nahi karta, to workloads ka return traffic uske bagal se nikal jaata hai aur sessions toot jaate hain (asymmetric routing).</p></div>
<div class="exam"><p><b>Exam trap.</b> AWS Transit Gateway Connect ke liye tunnel GRE hai aur routing protocol BGP; external BGP peer ko multihop chahiye; transit gateway ASN default 64512 hai aur FortiGate ke ASN se alag hona chahiye. Azure vWAN mein template ASN hub NVA ASN ke barabar hona chahiye.</p></div>
<div class="scn"><h4>Cloud tunnel up hai, application unreachable hai</h4><p>CLOUD1-FGT ka GRE tunnel established hai aur transit gateway ke saath BGP session up hai. Branch FortiGate ka inside address ping karti hai par application server nahi. Workload subnet ka route table abhi bhi apne branch prefixes ko transit gateway ke purane attachment ki taraf point karta hai, FortiGate ki taraf nahi. Route table badalne se replies CLOUD1-FGT ke through wapas aaye.</p><p><b>Seekh:</b> Cloud mein FortiGate par BGP routing ka aadha hissa hai. Baaki aadha cloud ke route tables hain.</p></div>
<div class="iv"><p class="q">"FortiGate-VM AWS Transit Gateway se kaise judta hai?"</p><p>Connect attachment ke through. Main FortiGate aur transit gateway ke tunnel endpoint ke beech GRE tunnel banata hoon, us endpoint tak static route ke saath, aur tunnel ke link-local addresses par multihop enabled external BGP chalata hoon. Do availability zones mein do FortiGates redundancy dete hain, aur har ek poora load utha sakta hai. Cloud route tables ko sahi prefixes attachment ya FortiGate ki taraf bhejne hote hain warna kaam nahi chalta.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>FortiGate-VM wahi FortiOS chalata hai, isliye overlay, BGP, SLA aur security features aage jaate hain.</li><li>AWS: GRE aur BGP ke saath Transit Gateway Connect. Azure: vWAN hub mein FortiGate NVA. Google Cloud: router appliance spoke ke saath NCC.</li><li>GRE setup ko endpoint tak static route, tunnel, aur multihop ke saath eBGP chahiye.</li><li>Cloud HA platform specific hai; har unit ko poore load ke liye size karo.</li><li>Cloud route tables design ka hissa hain.</li></ul></div>
`}};export{e as default};