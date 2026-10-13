var e=[{title:{en:`Which route wins?`,hi:`Kaunsa route jeetega?`},ticket:{en:`Kochi users say the analytics server is slow although OSPF has a fast path. This is R1.`,hi:`Kochi ke users kehte hain analytics server slow hai jabki OSPF ka tez path hai. Yeh R1 hai.`},out:`lab@R1-KOCHI> show route 172.16.60.0/24

inet.0: 9 destinations, 10 routes (9 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

172.16.60.0/24     *[Static/5] 02:14:37
                    >  to 10.3.13.2 via ge-0/0/1.0
                    [OSPF/10] 02:10:11, metric 3
                    >  to 10.3.12.2 via ge-0/0/0.0`,q:{en:`What is the best fix?`,hi:`Sabse achha fix kya hai?`},o:[{en:`Raise the static preference above 10, for example 200`,hi:`Static ki preference 10 se upar karo, jaise 200`},{en:`Delete OSPF`,hi:`OSPF delete karo`},{en:`Lower the OSPF metric to 1`,hi:`OSPF metric 1 karo`},{en:`Reboot R1`,hi:`R1 reboot karo`}],a:0,w:{en:`Static preference 5 beats OSPF 10; metrics are not compared across protocols. Raising the static keeps it as a backup.`,hi:`Static preference 5 OSPF 10 ko haraati hai; alag protocols ke metrics compare nahi hote. Static ko uthane se woh backup rehta hai.`}},{title:{en:`Longest match`,hi:`Longest match`},ticket:{en:`R2 receives a packet for 192.168.10.10. These are its routes.`,hi:`R2 ko 192.168.10.10 ka packet milta hai. Yeh uske routes hain.`},out:`lab@R2-CORE> show route protocol static

192.168.0.0/16     *[Static/5] 00:05:02
                      Discard
192.168.10.0/24    *[Static/5] 00:12:55
                    >  to 10.1.12.1 via ge-0/0/0.0
172.16.30.0/24     *[Static/5] 00:12:55
                    >  to 10.1.23.2 via ge-0/0/1.0`,q:{en:`What does R2 do with the packet?`,hi:`R2 packet ka kya karta hai?`},o:[{en:`Drops it because of the /16 discard`,hi:`/16 discard ki wajah se drop karta hai`},{en:`Forwards it to 10.1.12.1`,hi:`10.1.12.1 ko forward karta hai`},{en:`Forwards it to 10.1.23.2`,hi:`10.1.23.2 ko forward karta hai`},{en:`Sends ICMP unreachable`,hi:`ICMP unreachable bhejta hai`}],a:1,w:{en:`The /24 is longer than the /16, so it wins; discard only catches addresses with no more specific route.`,hi:`/24 /16 se lamba hai, isliye jeetta hai; discard sirf unhe pakadta hai jinka koi zyada specific route nahi.`}},{title:{en:`Hidden route`,hi:`Hidden route`},ticket:{en:`A new static route does not appear in the forwarding table. Output below.`,hi:`Naya static route forwarding table mein nahi dikhta. Output niche hai.`},out:`lab@R1> show configuration routing-options
static {
    route 203.0.113.0/24 next-hop 10.9.9.9;
}

lab@R1> show route 203.0.113.0/24 hidden

inet.0: 6 destinations, 7 routes (6 active, 0 holddown, 1 hidden)
203.0.113.0/24      [Static/5] 00:01:12
                      Unusable`,q:{en:`What is missing?`,hi:`Kya missing hai?`},o:[{en:`discard`,hi:`discard`},{en:`reject`,hi:`reject`},{en:`family inet6`,hi:`family inet6`},{en:`resolve, because 10.9.9.9 is not directly connected`,hi:`resolve, kyunki 10.9.9.9 directly connected nahi hai`}],a:3,w:{en:`A static next hop must be directly connected unless the route has resolve (or you use the real neighbour).`,hi:`Static next hop directly connected hona chahiye jab tak route par resolve na ho (ya asli neighbour use karo).`}},{title:{en:`Fibre cut`,hi:`Fibre cut`},ticket:{en:`In Surat R1 has a floating static. The fibre interface ge-0/0/0 was just disabled for a test.`,hi:`Surat mein R1 ke paas floating static hai. Test ke liye fibre interface ge-0/0/0 abhi disable kiya gaya.`},out:`lab@R1-SURAT> show route 172.16.40.0/24

172.16.40.0/24     *[Static/20] 00:00:07
                    >  to 10.2.12.2 via ge-0/0/1.0

lab@R1-SURAT> traceroute 172.16.40.10
 1  10.2.12.2 (10.2.12.2)  0.9 ms  0.7 ms  0.7 ms
 2  10.2.23.2 (10.2.23.2)  1.3 ms  1.1 ms  1.0 ms
 3  172.16.40.10 (172.16.40.10)  1.8 ms  1.6 ms  1.5 ms`,q:{en:`What does the output prove?`,hi:`Output kya saabit karta hai?`},o:[{en:`The backup route is not working`,hi:`Backup route kaam nahi kar raha`},{en:`OSPF has taken over`,hi:`OSPF ne le liya`},{en:`The floating static (preference 20) became active and traffic goes via R2`,hi:`Floating static (preference 20) active ho gaya aur traffic R2 se ja raha hai`},{en:`The default route is used`,hi:`Default route use ho raha hai`}],a:2,w:{en:`*[Static/20] shows the backup is now active, and the trace confirms the path through R2 (10.2.12.2).`,hi:`*[Static/20] dikhata hai backup ab active hai, aur trace R2 (10.2.12.2) wala path confirm karta hai.`}},{title:{en:`IPv6 not working`,hi:`IPv6 nahi chal raha`},ticket:{en:`IPv4 works at a new office but IPv6 sites time out. This is the IPv6 table of the edge router.`,hi:`Naye office mein IPv4 chalta hai lekin IPv6 sites time out hoti hain. Yeh edge router ki IPv6 table hai.`},out:`lab@R1> show route table inet6.0

inet6.0: 3 destinations, 3 routes (3 active, 0 holddown, 0 hidden)
2001:db8:12::/64   *[Direct/0] 00:09:12
                    >  via ge-0/0/0.0
2001:db8:12::1/128 *[Local/0] 00:09:12
                      Local via ge-0/0/0.0
fe80::/64          *[Direct/0] 00:09:12
                    >  via ge-0/0/0.0`,q:{en:`What should you configure?`,hi:`Kya configure karna chahiye?`},o:[{en:`set routing-options static route ::/0 next-hop 2001:db8:12::2`,hi:`set routing-options static route ::/0 next-hop 2001:db8:12::2`},{en:`set routing-options rib inet6.0 static route ::/0 next-hop 2001:db8:12::2`,hi:`set routing-options rib inet6.0 static route ::/0 next-hop 2001:db8:12::2`},{en:`set routing-options static route 0.0.0.0/0 next-hop 2001:db8:12::2`,hi:`set routing-options static route 0.0.0.0/0 next-hop 2001:db8:12::2`},{en:`set interfaces ge-0/0/0 disable`,hi:`set interfaces ge-0/0/0 disable`}],a:1,w:{en:`IPv6 statics go under rib inet6.0, and the IPv6 default route is ::/0.`,hi:`IPv6 statics rib inet6.0 ke neeche jaate hain, aur IPv6 default route ::/0 hai.`}},{title:{en:`Replies get lost`,hi:`Replies kho jaate hain`},ticket:{en:`PC1 cannot reach SRV. A traceroute from R1 reaches SRV, but the ping from PC1 times out. This is R2.`,hi:`PC1 SRV tak nahi pahunch pa raha. R1 se traceroute SRV tak pahunchta hai, lekin PC1 ki ping time out hoti hai. Yeh R2 hai.`},out:`lab@R2-CORE> show route 192.168.10.10

lab@R2-CORE> show route 172.16.30.10

inet.0: 6 destinations, 6 routes (6 active, 0 holddown, 0 hidden)
172.16.30.0/24     *[Static/5] 00:03:21
                    >  to 10.1.23.2 via ge-0/0/1.0`,q:{en:`What is the problem?`,hi:`Problem kya hai?`},o:[{en:`No route to the PC1 LAN 192.168.10.0/24 on R2: the return path is broken`,hi:`R2 par PC1 LAN 192.168.10.0/24 ka route nahi: return path toota hai`},{en:`The static route to SRV has the wrong preference`,hi:`SRV ke static route ki preference galat hai`},{en:`R2 has a duplex mismatch`,hi:`R2 par duplex mismatch hai`},{en:`The server is down`,hi:`Server down hai`}],a:0,w:{en:`show route 192.168.10.10 returned nothing, so replies have no route back. Add 192.168.10.0/24 via R1.`,hi:`show route 192.168.10.10 kuch nahi laaya, isliye replies ke paas wapas ka route nahi. R1 ke through 192.168.10.0/24 lagao.`}},{title:{en:`Safe black hole`,hi:`Safe black hole`},ticket:{en:`You add a 192.168.0.0/16 discard route on R2 for future branches and are worried it will break the Nagpur LAN 192.168.10.0/24.`,hi:`Aap aane wali branches ke liye R2 par 192.168.0.0/16 discard route lagate ho aur dar hai ki Nagpur LAN 192.168.10.0/24 toot jaayega.`},out:`lab@R2-CORE> show route 192.168.0.0/16 longer

192.168.0.0/16     *[Static/5] 00:00:31
                      Discard
192.168.10.0/24    *[Static/5] 00:12:55
                    >  to 10.1.12.1 via ge-0/0/0.0`,q:{en:`Why does the Nagpur LAN keep working?`,hi:`Nagpur LAN chalta kyun rehta hai?`},o:[{en:`Discard routes are ignored for connected LANs`,hi:`Discard routes connected LANs ke liye ignore hote hain`},{en:`Both routes load-balance`,hi:`Dono routes load-balance karte hain`},{en:`The /24 is more specific than the /16, so longest match picks it`,hi:`/24 /16 se zyada specific hai, isliye longest match use chunta hai`},{en:`The /16 has a higher preference`,hi:`/16 ki preference zyada hai`}],a:2,w:{en:`Longest prefix match comes before preference; the /24 carves a hole in the /16 black hole.`,hi:`Longest prefix match preference se pehle aata hai; /24 /16 ke black hole mein surakh bana deta hai.`}}];export{e as default};