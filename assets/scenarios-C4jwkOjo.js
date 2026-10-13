var e=[{title:{en:`New laptop, "no internet"`,hi:`Naya laptop, "no internet"`},ticket:{en:`HR desk, 3rd floor: "My new laptop is plugged in but says No internet. Other people near me are fine." The help-desk engineer asked the user to run ipconfig /all.`,hi:`HR desk, 3rd floor: "Mera naya laptop plugged in hai lekin No internet dikhata hai. Mere aas-paas baaki log theek hain." Help-desk engineer ne user se ipconfig /all chalwaya.`},out:`Ethernet adapter Ethernet:

   Description . . . . . . . . . . . : Intel(R) Ethernet Connection I219-LM
   Physical Address. . . . . . . . . : 3C-52-82-1A-2B-3C
   DHCP Enabled. . . . . . . . . . . : Yes
   Autoconfiguration Enabled . . . . : Yes
   Link-local IPv6 Address . . . . . : fe80::9c1d:4a2e:77b1:5c02%12(Preferred)
   Autoconfiguration IPv4 Address. . : 169.254.37.112(Preferred)
   Subnet Mask . . . . . . . . . . . : 255.255.0.0
   Default Gateway . . . . . . . . . :
   DNS Servers . . . . . . . . . . . : fec0:0:0:ffff::1%1
                                       fec0:0:0:ffff::2%1
                                       fec0:0:0:ffff::3%1
   NetBIOS over Tcpip. . . . . . . . : Enabled`,q:{en:`What does this output tell you?`,hi:`Yeh output aapko kya batata hai?`},o:[{en:`The internet link of the office is down; call the ISP.`,hi:`Office ka internet link down hai; ISP ko call karo.`},{en:`The laptop gave itself an APIPA address because no DHCP server answered; check this laptop's cable, switch port and its path to the DHCP server.`,hi:`Laptop ne khud ko APIPA address diya kyunki kisi DHCP server ne jawab nahi diya; is laptop ki cable, switch port aur DHCP server tak ka raasta check karo.`},{en:`The DNS server is wrong; change DNS to a public resolver.`,hi:`DNS server galat hai; DNS ko public resolver par badlo.`},{en:`The laptop has a static address typed in by mistake; this is normal for new laptops.`,hi:`Laptop mein galti se static address type hai; naye laptops ke liye yeh normal hai.`}],a:1,w:{en:`169.254.x.x with mask 255.255.0.0 and no gateway is APIPA: DHCP is enabled but no server answered. Neighbours are fine, so the DHCP server and internet are up; the fault is local to this laptop's link (cable, wall port, switch port or its VLAN). Fix the link, then ipconfig /renew.`,hi:`169.254.x.x, mask 255.255.0.0 aur koi gateway nahi APIPA hai: DHCP enabled hai lekin kisi server ne jawab nahi diya. Padosi theek hain, isliye DHCP server aur internet up hain; fault is laptop ke link par local hai (cable, wall port, switch port ya uska VLAN). Link theek karo, phir ipconfig /renew.`}},{title:{en:`Websites fail, but pings work`,hi:`Websites fail, lekin pings chalte hain`},ticket:{en:`Accounts user: "No website opens since yesterday." The user had followed an online tip to "speed up the internet". The engineer collected the output below.`,hi:`Accounts user: "Kal se koi website nahi khul rahi." User ne "internet fast karne" ki ek online tip follow ki thi. Engineer ne neeche wala output collect kiya.`},out:`   IPv4 Address. . . . . . . . . . . : 192.168.1.40
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1
   DNS Servers . . . . . . . . . . . : 192.0.2.53

Pinging 203.0.113.80 with 32 bytes of data:
Reply from 203.0.113.80: bytes=32 time=24ms TTL=52
Reply from 203.0.113.80: bytes=32 time=23ms TTL=52
Reply from 203.0.113.80: bytes=32 time=25ms TTL=52
Reply from 203.0.113.80: bytes=32 time=24ms TTL=52

nslookup www.nkshop.example
DNS request timed out.
    timeout was 2 seconds.
Server:  UnKnown
Address:  192.0.2.53

DNS request timed out.
    timeout was 2 seconds.
*** Request to UnKnown timed-out`,q:{en:`What is the most likely cause?`,hi:`Sabse sambhavit cause kya hai?`},o:[{en:`The web server 203.0.113.80 is down.`,hi:`Web server 203.0.113.80 down hai.`},{en:`The default gateway is wrong.`,hi:`Default gateway galat hai.`},{en:`The subnet mask should be 255.255.0.0.`,hi:`Subnet mask 255.255.0.0 hona chahiye.`},{en:`The manually set DNS server 192.0.2.53 does not answer; set DNS back to automatic (or the correct server).`,hi:`Haath se set DNS server 192.0.2.53 jawab nahi deta; DNS ko wapas automatic (ya sahi server) par set karo.`}],a:3,w:{en:`Pings to a remote IP succeed, so the link, IP settings, gateway and routing all work. Only name resolution fails: nslookup times out against 192.0.2.53, the DNS server the user typed in. Classic "works by IP, not by name" = DNS.`,hi:`Remote IP ke pings succeed hote hain, isliye link, IP settings, gateway aur routing sab chal rahe hain. Sirf name resolution fail hai: nslookup 192.0.2.53 ke against time out hota hai, jo DNS server user ne type kiya. Classic "IP se chalta hai, naam se nahi" = DNS.`}},{title:{en:`Printer works, internet does not`,hi:`Printer chalta hai, internet nahi`},ticket:{en:`A technician set up a new PC with a static address yesterday. Today the user can print to 192.168.1.50 but cannot open any website.`,hi:`Ek technician ne kal naye PC ko static address ke saath set up kiya. Aaj user 192.168.1.50 par print kar sakta hai lekin koi website nahi khol sakta.`},out:`   IPv4 Address. . . . . . . . . . . : 192.168.1.40
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . :

Pinging 192.168.1.50 with 32 bytes of data:
Reply from 192.168.1.50: bytes=32 time=1ms TTL=64
Reply from 192.168.1.50: bytes=32 time=1ms TTL=64
Reply from 192.168.1.50: bytes=32 time=2ms TTL=64
Reply from 192.168.1.50: bytes=32 time=1ms TTL=64

Pinging 203.0.113.80 with 32 bytes of data:
PING: transmit failed. General failure.
PING: transmit failed. General failure.
PING: transmit failed. General failure.
PING: transmit failed. General failure.

Ping statistics for 203.0.113.80:
    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss),`,q:{en:`What should the engineer fix?`,hi:`Engineer ko kya theek karna chahiye?`},o:[{en:`Add the default gateway 192.168.1.1 to the PC's IP settings.`,hi:`PC ki IP settings mein default gateway 192.168.1.1 add karo.`},{en:`Replace the network cable, because the link is faulty.`,hi:`Network cable badlo, kyunki link kharab hai.`},{en:`Change the DNS server.`,hi:`DNS server badlo.`},{en:`Change the subnet mask to 255.255.255.255.`,hi:`Subnet mask ko 255.255.255.255 karo.`}],a:0,w:{en:`The printer on the same subnet answers, so the cable, IP and mask are fine. The Default Gateway line is empty, so the PC has no router for remote destinations and Windows reports "transmit failed. General failure." Adding gateway 192.168.1.1 fixes it. DNS is not the issue: even a raw IP fails.`,hi:`Same subnet ka printer jawab deta hai, isliye cable, IP aur mask theek hain. Default Gateway line khaali hai, isliye PC ke paas remote destinations ke liye koi router nahi hai aur Windows "transmit failed. General failure." report karta hai. Gateway 192.168.1.1 add karne se theek hoga. DNS issue nahi hai: raw IP bhi fail ho raha hai.`}},{title:{en:`New joiner's desk is dead`,hi:`Naye joiner ki desk dead hai`},ticket:{en:`A new joiner was seated at desk 4B-17. The PC's network icon shows a red cross. Facilities moved the furniture over the weekend. ipconfig output below; the light on the wall port's switch port is off.`,hi:`Ek naye joiner ko desk 4B-17 par bithaya gaya. PC ka network icon laal cross dikhata hai. Facilities ne weekend mein furniture shift kiya. Neeche ipconfig output hai; wall port ke switch port ki light off hai.`},out:`Windows IP Configuration


Ethernet adapter Ethernet:

   Media State . . . . . . . . . . . : Media disconnected
   Connection-specific DNS Suffix  . :

Wireless LAN adapter Wi-Fi:

   Media State . . . . . . . . . . . : Media disconnected
   Connection-specific DNS Suffix  . :`,q:{en:`Which layer is the problem at, and what is the first thing to check?`,hi:`Problem kaunsi layer par hai, aur sabse pehle kya check karna chahiye?`},o:[{en:`Layer 7: reinstall the browser.`,hi:`Layer 7: browser reinstall karo.`},{en:`Layer 3: the IP address is in the wrong subnet.`,hi:`Layer 3: IP address galat subnet mein hai.`},{en:`Layer 1: no link at all; check the cable from PC to wall port and the patch in the rack.`,hi:`Layer 1: link hai hi nahi; PC se wall port tak cable aur rack mein patch check karo.`},{en:`DNS: flush the DNS cache.`,hi:`DNS: DNS cache flush karo.`}],a:2,w:{en:`"Media disconnected" means the NIC sees no signal, and the switch port light is off: a physical problem. There is no IP address to judge yet. Reseat or replace the patch cable, check the wall port is patched to a live switch port, then confirm the link light and a DHCP address.`,hi:`"Media disconnected" ka matlab hai NIC ko koi signal nahi dikhta, aur switch port light off hai: physical problem. Abhi judge karne ke liye koi IP address hi nahi hai. Patch cable dobara lagao ya badlo, check karo ki wall port live switch port se patched hai, phir link light aur DHCP address confirm karo.`}},{title:{en:`Whole home office offline`,hi:`Poora home office offline`},ticket:{en:`A work-from-home employee says every device in the house lost internet at 11:00. Laptops still show Wi-Fi connected with 192.168.1.x addresses. The fibre box (ONT) has a red LOS light.`,hi:`Ek work-from-home employee kehta hai ki 11:00 baje ghar ke har device ka internet chala gaya. Laptops abhi bhi 192.168.1.x addresses ke saath Wi-Fi connected dikhate hain. Fibre box (ONT) par laal LOS light hai.`},out:`Tracing route to 203.0.113.80 over a maximum of 30 hops

  1     1 ms     1 ms     1 ms  192.168.1.1
  2     *        *        *     Request timed out.
  3     *        *        *     Request timed out.
  4     *        *        *     Request timed out.
  5     *        *        *     Request timed out.

Home router status:
  Internet (WAN) ..... Disconnected
  LAN / Wi-Fi ........ Up, 6 clients`,q:{en:`Where is the fault?`,hi:`Fault kahan hai?`},o:[{en:`On the laptop: its DHCP settings are wrong.`,hi:`Laptop par: uski DHCP settings galat hain.`},{en:`Beyond the home router, on the ISP fibre link: the ONT has lost signal, so the ISP must fix the line.`,hi:`Home router ke aage, ISP fibre link par: ONT ka signal chala gaya hai, isliye ISP ko line theek karni hogi.`},{en:`The home Wi-Fi: change the Wi-Fi channel.`,hi:`Ghar ka Wi-Fi: Wi-Fi channel badlo.`},{en:`DNS: the resolver is down.`,hi:`DNS: resolver down hai.`}],a:1,w:{en:`Hop 1 (the home router) answers, so the LAN and Wi-Fi are fine; everything beyond it fails for every device. The router shows the WAN disconnected and the ONT's LOS (loss of signal) light is red: the fibre line or the ISP side is down. Check the fibre patch is not bent or unplugged, then raise a ticket with the ISP.`,hi:`Hop 1 (home router) jawab deta hai, isliye LAN aur Wi-Fi theek hain; uske aage sab kuch har device ke liye fail hai. Router WAN disconnected dikhata hai aur ONT ki LOS (loss of signal) light laal hai: fibre line ya ISP side down hai. Check karo ki fibre patch mudi ya nikli to nahi, phir ISP ke saath ticket raise karo.`}},{title:{en:`Simulator task will not pass`,hi:`Simulator task pass nahi ho raha`},ticket:{en:`A learner in the lab simulator must make "PC1 can ping R1 (192.168.10.1)" pass. R1's interface is up with 192.168.10.1/24. The learner's PC1 console shows the output below.`,hi:`Lab simulator mein ek learner ko "PC1 R1 (192.168.10.1) ko ping kar sakta hai" pass karwana hai. R1 ka interface 192.168.10.1/24 ke saath up hai. Learner ke PC1 console par neeche wala output hai.`},out:`[PC1] ip 192.168.10.10/24 192.168.1.1
Gateway is not in the same subnet
[PC1] show ip
NAME        : PC1[1]
IP/MASK     : 0.0.0.0/0
GATEWAY     : 0.0.0.0
DNS         :
MAC         : 00:50:79:66:68:00
MTU         : 1500
[PC1] ping 192.168.10.1
No IP address configured`,q:{en:`What is wrong, and what is the correct command?`,hi:`Kya galat hai, aur sahi command kya hai?`},o:[{en:`The simulator is broken; press Reset and try the same command again.`,hi:`Simulator kharab hai; Reset dabao aur wahi command dobara try karo.`},{en:`The mask /24 is too small; use ip 192.168.10.10/16 192.168.1.1.`,hi:`Mask /24 bahut chhota hai; ip 192.168.10.10/16 192.168.1.1 use karo.`},{en:`PC1 needs DNS first; use ip dns 192.168.10.1.`,hi:`PC1 ko pehle DNS chahiye; ip dns 192.168.10.1 use karo.`},{en:`The gateway must be in PC1's own subnet, so the command was rejected; use ip 192.168.10.10/24 192.168.10.1.`,hi:`Gateway PC1 ke apne subnet mein hona chahiye, isliye command reject hua; ip 192.168.10.10/24 192.168.10.1 use karo.`}],a:3,w:{en:`192.168.1.1 is not in 192.168.10.0/24, so the PC rejected the whole command and still has no address (0.0.0.0/0), which is why ping says "No IP address configured". The gateway is R1's own address on this LAN: ip 192.168.10.10/24 192.168.10.1. Widening the mask to hide the mistake is wrong design.`,hi:`192.168.1.1 192.168.10.0/24 mein nahi hai, isliye PC ne poora command reject kiya aur abhi bhi koi address nahi hai (0.0.0.0/0), isiliye ping "No IP address configured" kehta hai. Gateway is LAN par R1 ka apna address hai: ip 192.168.10.10/24 192.168.10.1. Galti chhupane ke liye mask bada karna galat design hai.`}},{title:{en:`"The website is down!" (is it?)`,hi:`"Website down hai!" (sach mein?)`},ticket:{en:`A new NOC engineer escalated a P1: "www.nkshop.example is down, ping fails." Customers are still placing orders. The senior engineer ran the commands below from the same PC.`,hi:`Ek naye NOC engineer ne P1 escalate kiya: "www.nkshop.example down hai, ping fail hota hai." Customers abhi bhi orders de rahe hain. Senior engineer ne usi PC se neeche wale commands chalaye.`},out:`Pinging www.nkshop.example [203.0.113.80] with 32 bytes of data:
Request timed out.
Request timed out.
Request timed out.
Request timed out.

Ping statistics for 203.0.113.80:
    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss),

PS Test-NetConnection www.nkshop.example -Port 443

ComputerName     : www.nkshop.example
RemoteAddress    : 203.0.113.80
RemotePort       : 443
InterfaceAlias   : Ethernet
SourceAddress    : 192.168.1.23
TcpTestSucceeded : True`,q:{en:`What is the right conclusion?`,hi:`Sahi nishkarsh kya hai?`},o:[{en:`The site is up: TCP 443 connects. The server or its firewall simply blocks ICMP, so ping alone is not proof of an outage.`,hi:`Site up hai: TCP 443 connect hota hai. Server ya uska firewall bas ICMP block karta hai, isliye sirf ping outage ka saboot nahi hai.`},{en:`The site is down; the TCP test is cached and cannot be trusted.`,hi:`Site down hai; TCP test cached hai aur us par bharosa nahi kiya ja sakta.`},{en:`DNS is broken, because the name did not resolve.`,hi:`DNS toota hua hai, kyunki naam resolve nahi hua.`},{en:`The engineer's PC has an APIPA address.`,hi:`Engineer ke PC ka APIPA address hai.`}],a:0,w:{en:`The name resolved to 203.0.113.80 (so DNS works) and the TCP connection to port 443 succeeded (so the web service is reachable). Pings time out because many servers and firewalls drop ICMP on purpose. Always test the real service before declaring an outage.`,hi:`Naam 203.0.113.80 par resolve hua (to DNS chal raha hai) aur port 443 ka TCP connection succeed hua (to web service reachable hai). Pings isliye time out hote hain kyunki bahut saare servers aur firewalls jaan-boojh kar ICMP drop karte hain. Outage declare karne se pehle hamesha asli service test karo.`}}];export{e as default};