// 测试网址检测间隔
const test_interval = 240;
// 测试网址的间隔差值，超过这个差值就会切换节点，越小切换越频繁
const test_tolerance = 80;

// 国内DNS服务器
const domesticNameservers = [
  'https://223.5.5.5/dns-query', // 阿里云DoH
  'https://119.29.29.29/dns-query', // 腾讯DoH
];
// 国外DNS服务器
const foreignNameservers = [
  'https://208.67.222.222/dns-query', // OpenDNS
  'https://77.88.8.8/dns-query', // YandexDNS
  'https://1.1.1.1/dns-query', // CloudflareDNS
  'https://8.8.4.4/dns-query', // GoogleDNS
];
// DNS配置
const dnsConfig = {
  /**
   * 是否启用，如为 false，则使用系统 DNS 解析
   */
  enable: true,
  /**
   * 支持的算法：
   * lru: Least Recently Used, 默认值
   * arc: Adaptive Replacement Cache
   */
  'cache-algorithm': 'arc',
  /**
   * DOH 优先使用 http/3
   */
  'prefer-h3': false,
  /**
   * DNS 服务监听，支持 udp, tcp
   */
  listen: '0.0.0.0:1053',
  /**
   * 是否解析 IPV6, 如为 false, 则回应 AAAA 的空解析
   */
  ipv6: true,
  /**
   * 可选值 fake-ip/redir-host，默认redir-host
   */
  'enhanced-mode': 'fake-ip',
  /**
   * fakeip 下的 IP 段设置，tun 的默认 IPV4 地址 也使用此值作为参考
   */
  'fake-ip-range': '198.18.0.1/16',
  /**
   * fakeip 过滤，以下地址不会下发 fakeip 映射用于连接
   */
  'fake-ip-filter': [
    '+.lan',
    '+.local',
    '+.msftconnecttest.com',
    '+.msftncsi.com',
    'localhost.ptlogin2.qq.com',
    'localhost.sec.qq.com',
    'localhost.work.weixin.qq.com',
    '*.localdomain',
    '*.example',
    '*.invalid',
    '*.localhost',
    '*.test',
    '*.local',
    '*.home.arpa',
  ],
  /**
   * 可选 blacklist/whitelist，默认blacklist，whitelist 即只有匹配成功才返回 fake-ip
   */
  'fake-ip-filter-mode': 'blacklist',
  /**
   * 是否回应配置中的 hosts，默认 true
   */
  'use-hosts': false,
  /**
   * 是否查询系统 hosts，默认 true
   */
  'use-system-hosts': true,
  /**
   * 指定域名查询的解析服务器，可使用 geosite, 优先于 nameserver/fallback 查询
   * 键支持域名通配
   * 值支持字符串/数组
   */
  'nameserver-policy': {
    'geosite:private,cn': domesticNameservers,
  },
  /**
   * 代理节点域名解析服务器，仅用于解析代理节点的域名，如果不填则遵循 nameserver-policy、nameserver 和 fallback 的配置
   */
  'proxy-server-nameserver': [...foreignNameservers, ...domesticNameservers],
  /**
   * 默认的域名解析服务器
   */
  nameserver: [...domesticNameservers],
};
// 域名嗅探配置
const snifferConfig = {
  /**
   * 是否启用 sniffer
   */
  enable: true,
  /**
   * 对 redir-host 类型识别的流量进行强制嗅探
   */
  'force-dns-mapping': true,
  /**
   * 对所有未获取到域名的流量进行强制嗅探
   */
  'parse-pure-ip': true,
  /**
   * 是否使用嗅探结果作为实际访问，默认为 true
   */
  'override-destination': true,
  /**
   * 需要嗅探的协议设置，仅支持 HTTP/TLS/QUIC
   * ports: 端口范围
   * override-destination: 覆盖全局override-destination设置
   */
  sniff: {
    HTTP: {
      ports: [80, '8080-8880'],
      'override-destination': true,
    },
    TLS: {
      ports: [443, 8443],
    },
    QUIC: {
      ports: [443, 8443],
    },
  },
};
// 代理组通用配置
const groupBaseOption = {
  /**
   * 健康检查测试地址
   */
  url: 'http://www.google.com/generate_204',
  /**
   * 健康检查间隔，如不为 0 则启用定时测试，单位为秒
   */
  interval: 300,
  /**
   * 懒惰状态，默认为true,未选择到当前策略组时，不进行测试
   */
  lazy: true,
  /**
   * 健康检查超时时间，单位为毫秒
   */
  timeout: 3000,
  /**
   * 禁用该策略组的UDP
   */
  'disable-udp': false,
  /**
   * 在 api 返回hidden状态，以隐藏该策略组展示 (需要使用 api 的前端适配)
   */
  hidden: false,
};
// 代理组配置
const proxyGroups = [
  {
    ...groupBaseOption,
    name: '节点选择',
    type: 'select',
    proxies: [
      '延迟选优',
      '手动选择',
      '故障转移',
      '负载均衡',
    ],
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Airport.png',
  },
  {
    ...groupBaseOption,
    name: '手动选择',
    type: 'select',
    'include-all': true,
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg',
  },
  {
    ...groupBaseOption,
    name: '漏网之鱼',
    type: 'select',
    proxies: ['全局直连', '节点选择', '手动选择', '延迟选优', '故障转移'],
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/fish.svg',
  },
  {
    ...groupBaseOption,
    name: 'Bing',
    type: 'select',
    proxies: ['全局直连', '节点选择', '手动选择', '延迟选优', '故障转移'],
    icon: 'https://www.bing.com/favicon.ico',
  },
  {
    ...groupBaseOption,
    name: 'Github',
    type: 'select',
    proxies: ['节点选择', '手动选择', '全局直连', '延迟选优', '故障转移'],
    icon: 'https://www.clashverge.dev/assets/icons/github.svg',
  },
  {
    ...groupBaseOption,
    name: '谷歌服务',
    type: 'select',
    proxies: ['节点选择', '手动选择', '全局直连', '延迟选优', '故障转移'],
    icon: 'https://www.clashverge.dev/assets/icons/google.svg',
  },
  {
    ...groupBaseOption,
    name: '苹果服务',
    type: 'select',
    proxies: ['全局直连', '节点选择', '手动选择', '延迟选优', '故障转移'],
    icon: 'https://www.clashverge.dev/assets/icons/apple.svg',
  },
  {
    ...groupBaseOption,
    name: '微软服务',
    type: 'select',
    proxies: ['全局直连', '节点选择', '手动选择', '延迟选优', '故障转移'],
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/microsoft.svg',
  },
  {
    ...groupBaseOption,
    name: 'Onedrive',
    type: 'select',
    proxies: ['全局直连', '节点选择', '手动选择', '延迟选优', '故障转移'],
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/OneDrive.png',
  },
  {
    ...groupBaseOption,
    name: 'AI',
    type: 'select',
    proxies: ['全局直连', '节点选择', '手动选择', '延迟选优', '故障转移'],
    icon: 'https://www.clashverge.dev/assets/icons/chatgpt.svg',
  },
  {
    ...groupBaseOption,
    name: 'Bilibili',
    type: 'select',
    proxies: ['全局直连'],
    icon: 'https://fastly.jsdelivr.net/gh/Orz-3/mini@master/Color/Bili.png',
  },
  {
    ...groupBaseOption,
    name: 'YouTube',
    type: 'select',
    proxies: ['节点选择', '手动选择', '延迟选优', '故障转移'],
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/youtube.svg',
  },
  {
    ...groupBaseOption,
    name: 'Netflix',
    type: 'select',
    proxies: ['节点选择', '手动选择', '延迟选优', '故障转移'],
    icon: 'https://www.clashverge.dev/assets/icons/netflix.svg',
  },
  {
    ...groupBaseOption,
    name: 'TikTok',
    type: 'select',
    proxies: ['节点选择', '手动选择', '延迟选优', '故障转移'],
    icon: 'https://fastly.jsdelivr.net/gh/shindgewongxj/WHATSINStash@master/icon/tiktok.png',
  },
  {
    ...groupBaseOption,
    name: 'Pornhub',
    type: 'select',
    proxies: ['节点选择', '手动选择', '延迟选优', '故障转移'],
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Pornhub_1.png',
  },
  {
    ...groupBaseOption,
    name: 'Spotify',
    type: 'select',
    proxies: ['全局直连', '节点选择', '手动选择', '延迟选优', '故障转移'],
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Spotify.png',
  },
  {
    ...groupBaseOption,
    name: 'Adobe',
    type: 'select',
    proxies: ['全局直连', 'REJECT', '节点选择'],
    icon: 'https://www.adobe.com/favicon.ico',
  },
  {
    ...groupBaseOption,
    name: '游戏服务',
    type: 'select',
    proxies: ['全局直连', '节点选择', '手动选择', '延迟选优', '故障转移'],
    icon: 'https://www.clashverge.dev/assets/icons/steam.svg',
  },
  {
    ...groupBaseOption,
    name: '电报消息',
    type: 'select',
    proxies: ['节点选择', '手动选择', '延迟选优', '故障转移'],
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/telegram.svg',
  },
  {
    ...groupBaseOption,
    name: '网速测试',
    type: 'select',
    proxies: ['全局直连'],
    'include-all': true,
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Speedtest.png',
  },
  {
    ...groupBaseOption,
    name: '负载均衡',
    type: 'load-balance',
    strategy: 'consistent-hashing',
    'include-all': true,
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/merry_go.svg',
  },
  {
    ...groupBaseOption,
    name: '故障转移',
    type: 'fallback',
    'include-all': true,
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/ambulance.svg',
  },
  {
    ...groupBaseOption,
    name: '全局直连',
    type: 'select',
    proxies: ['DIRECT', 'REJECT', '节点选择', '手动选择'],
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/link.svg',
  },
  {
    ...groupBaseOption,
    name: '延迟选优',
    type: 'url-test',
    interval: test_interval,
    tolerance: test_tolerance,
    'include-all': true,
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/speed.svg',
  },
];
// 规则集通用配置
const ruleProviderCommon = {
  /**
   * 必须，provider类型，可选http / file / inline
   */
  type: 'http',
    /**
   * 更新provider的时间，单位为秒
   */
  interval: 86400,
  /**
   * 格式，可选 yaml/text/mrs，默认 yaml
   * mrs目前 behavior 仅支持 domain/ipcidr，可以通过mihomo convert-ruleset domain/ipcidr yaml/text XXX.yaml XXX.mrs转换得到
   */
  format: 'mrs',
};
// 规则集配置
const ruleProviders = {
  ipdirect: {
    ...ruleProviderCommon,
    behavior: 'ipcidr',
    url: 'https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/cn.mrs',
    path: './ruleset/cncidr.mrs',
  },
  ipprivate: {
    ...ruleProviderCommon,
    behavior: 'ipcidr',
    url: 'https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/private.mrs',
    path: './ruleset/lancidr.mrs',
  },
  direct: {
    ...ruleProviderCommon,
    behavior: 'domain',
    url: 'https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/cn.mrs',
    path: './ruleset/direct.mrs',
  },
  private: {
    ...ruleProviderCommon,
    behavior: 'domain',
    url: 'https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/private.mrs',
    path: './ruleset/private.mrs',
  },
  google: {
    ...ruleProviderCommon,
    behavior: 'domain',
    url: 'https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/google.mrs',
    path: './ruleset/google.mrs',
  },
  microsoft: {
    ...ruleProviderCommon,
    behavior: 'domain',
    url: 'https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/microsoft.mrs',
    path: './ruleset/microsoft.mrs',
  },
  apple: {
    ...ruleProviderCommon,
    behavior: 'domain',
    url: 'https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/apple.mrs',
    path: './ruleset/apple.mrs',
  },
  bing: {
    ...ruleProviderCommon,
    behavior: 'domain',
    url: 'https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/bing.mrs',
    path: './ruleset/bing.mrs',
  },
  github: {
    ...ruleProviderCommon,
    behavior: 'domain',
    url: 'https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/github.mrs',
    path: './ruleset/github.mrs',
  },
  onedrive: {
    ...ruleProviderCommon,
    behavior: 'domain',
    url: 'https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/onedrive.mrs',
    path: './ruleset/onedrive.mrs',
  },
  youtube: {
    ...ruleProviderCommon,
    behavior: 'domain',
    url: 'https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/youtube.mrs',
    path: './ruleset/youtube.mrs',
  },
  pornhub: {
    ...ruleProviderCommon,
    behavior: 'domain',
    url: 'https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/pornhub.mrs',
    path: './ruleset/pornhub.mrs',
  },
  netflix_ip: {
    ...ruleProviderCommon,
    behavior: 'ipcidr',
    url: 'https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geoip/netflix.mrs',
    path: './ruleset/netflix-ip.mrs',
  },
  netflix_site: {
    ...ruleProviderCommon,
    behavior: 'domain',
    url: 'https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/netflix.mrs',
    path: './ruleset/netflix-site.mrs',
  },
  adobe: {
    ...ruleProviderCommon,
    behavior: 'domain',
    url: 'https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/adobe.mrs',
    path: './ruleset/adobe.mrs',
  },
  ai: {
    ...ruleProviderCommon,
    behavior: 'domain',
    url: 'https://github.com/DustinWin/ruleset_geodata/releases/download/mihomo-ruleset/ai.mrs',
    path: './ruleset/ai.mrs',
  },
  bilibili: {
    ...ruleProviderCommon,
    behavior: 'domain',
    url: 'https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/bilibili.mrs',
    path: './ruleset/bilibili.mrs',
  },
  tiktok: {
    ...ruleProviderCommon,
    behavior: 'domain',
    url: 'https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/tiktok.mrs',
    path: './ruleset/tiktok.mrs',
  },
  spotify: {
    ...ruleProviderCommon,
    behavior: 'domain',
    url: 'https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/spotify.mrs',
    path: './ruleset/spotify.mrs',
  },
  speedtest: {
    ...ruleProviderCommon,
    behavior: 'domain',
    url: 'https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/speedtest.mrs',
    path: './ruleset/speedtest.mrs',
  },
  games: {
    ...ruleProviderCommon,
    behavior: 'domain',
    url: 'https://github.com/DustinWin/ruleset_geodata/releases/download/mihomo-ruleset/games-cn.mrs',
    path: './ruleset/games.mrs',
  },
  telegramcidr: {
    ...ruleProviderCommon,
    behavior: 'ipcidr',
    url: 'https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geoip/telegram.mrs',
    path: './ruleset/telegramcidr.mrs',
  },
  proxy: {
    ...ruleProviderCommon,
    behavior: 'domain',
    url: 'https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo-lite/geosite/proxy.mrs',
    path: './rulesets/loyalsoldier/proxy.mrs',
  },
  gfw: {
    ...ruleProviderCommon,
    behavior: 'domain',
    url: 'https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/gfw.mrs',
    path: './ruleset/gfw.mrs',
  },
  'tld-not-cn': {
    ...ruleProviderCommon,
    behavior: 'domain',
    url: 'https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/tld-!cn.mrs',
    path: './ruleset/tld-not-cn.mrs',
  },
};
// 规则配置
const rules = [
  // 'DOMAIN-SUFFIX,gstatic.com,节点选择',
  'RULE-SET,ipdirect,全局直连,no-resolve',
  'RULE-SET,ipprivate,全局直连,no-resolve',
  'RULE-SET,telegramcidr,电报消息,no-resolve',
  'RULE-SET,direct,全局直连',
  'RULE-SET,private,全局直连',
  'RULE-SET,google,谷歌服务',
  'RULE-SET,apple,苹果服务',
  'RULE-SET,bing,Bing',
  'RULE-SET,github,Github',
  'RULE-SET,onedrive,Onedrive',
  'RULE-SET,microsoft,微软服务',
  'RULE-SET,ai,AI',
  'RULE-SET,youtube,YouTube',
  'RULE-SET,netflix_ip,Netflix',
  'RULE-SET,netflix_site,Netflix',
  'RULE-SET,tiktok,TikTok',
  'RULE-SET,adobe,Adobe',
  'RULE-SET,pornhub,Pornhub',
  'RULE-SET,spotify,Spotify',
  'RULE-SET,games,游戏服务',
  'RULE-SET,speedtest,网速测试',
  'RULE-SET,bilibili,Bilibili',
  'RULE-SET,proxy,节点选择',
  'RULE-SET,gfw,节点选择',
  'RULE-SET,tld-not-cn,节点选择',
  // 未匹配的规则
  'MATCH,漏网之鱼',
];

// 地区配置
const regionConfig = [
  {
    name: '🇺🇸 美国',
    matcher: '美国|🇺🇸|US|United States|America',
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/us.svg',
  },
  {
    name: '🇯🇵 日本',
    matcher: '日本|🇯🇵|JP|Japan',
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/jp.svg',
  },
  {
    name: '🇰🇷 韩国',
    matcher: '韩|🇰🇷|kr|korea',
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/kr.svg',
  },
  {
    name: '🇸🇬 新加坡',
    matcher: '新加坡|🇸🇬|SG|狮城|Singapore',
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/sg.svg',
  },
  {
    name: '🇭🇰 香港',
    matcher: '香港|🇭🇰|HK|Hong Kong|HongKong',
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/hk.svg',
  },
  {
    name: '🇨🇳 台湾',
    matcher: '台湾|🇨🇳|tw|taiwan|Taiwan|tai wan',
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/cn.svg',
  },
  {
    name: '🇬🇧 英国',
    matcher: '英|🇬🇧|uk|united kingdom|great britain',
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/gb.svg',
  },
  {
    name: '🇫🇷 法国',
    matcher: '法国|🇫🇷|FR|France',
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/fr.svg',
  },
  {
    name: '🇩🇪 德国',
    matcher: '德国|🇩🇪|DE|germany',
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/de.svg',
  },
  {
    name: '🇵🇱 波兰',
    matcher: '波兰|🇵🇱|Poland|PL|Poland',
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/pl.svg',
  },
  {
    name: '🇳🇱 荷兰',
    matcher: '荷兰|🇳🇱|NL|Netherlands',
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/nl.svg',
  },
  {
    name: '🇮🇪 爱尔兰',
    matcher: '爱尔兰|🇮🇪|IE|Ireland',
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/ie.svg',
  },
  {
    name: '🇸🇪 瑞典',
    matcher: '瑞典|🇸🇪|SE|Sweden',
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/se.svg',
  },
  {
    name: '🇷🇺 俄罗斯',
    matcher: '俄罗斯|🇷🇺|RU|Russia',
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/ru.svg',
  },
  {
    name: '🇮🇹 意大利',
    matcher: '意大利|🇮🇹|IT|Italy',
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/it.svg',
  },
  {
    name: '🇪🇸 西班牙',
    matcher: '西班牙|🇪🇸|ES|Spain',
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/es.svg',
  },
  {
    name: '🇵🇹 葡萄牙',
    matcher: '葡萄牙|🇵🇹|PT|Portugal',
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/pt.svg',
  },
  {
    name: '🇹🇷 土耳其',
    matcher: '土耳其|🇹🇷|TR|Turkey',
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/tr.svg',
  },
  {
    name: '🇦🇷 阿根廷',
    matcher: '阿根廷|🇦🇷|AR|Argentina',
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/ar.svg',
  },
  {
    name: '🇨🇦 加拿大',
    matcher: '加拿大|🇨🇦|CA|Canada',
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/ca.svg',
  },
  {
    name: '🇦🇺 澳大利亚',
    matcher: '澳大利亚|🇦🇺|AU|Australia',
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/au.svg',
  },
  {
    name: '🇮🇷 伊朗',
    matcher: '伊朗|🇮🇷|IR|Iran',
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/ir.svg',
  },
  {
    name: '🇮🇩 印度尼西',
    matcher: '印度尼西亚|印尼|🇮🇩|ID|Indonesia',
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/id.svg',
  },
  {
    name: '🇲🇾 马来西亚',
    matcher: '马来|🇲🇾|MY|Malaysia',
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/my.svg',
  },
  {
    name: '🇵🇭 菲律宾',
    matcher: '菲律宾|🇵🇭|PH|Philippines',
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/ph.svg',
  },
  {
    name: '🇮🇳 印度',
    matcher: '印度|🇮🇳|IN|India',
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/in.svg',
  },
  {
    name: '🇻🇳 越南',
    matcher: '越南|🇻🇳|VN|Vietnam',
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/vn.svg',
  },
  {
    name: '🇹🇭 泰国',
    matcher: '泰国|🇹🇭|TH|Thailand',
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/th.svg',
  },
  {
    name: '🌐 其他',
    icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Global.png',
  },
];
// 添加地区分组
function addRegions(config) {
  let regions = [];
  if (!config.proxies) {
    if (!config['proxy-providers']) return;
    const providers = Object.keys(config['proxy-providers']);
    if (providers.length === 0) return;
    let exclude = '';
    for (const region of regionConfig) {
      if (!region.name) continue;
      if (region.matcher) {
        exclude += exclude === '' ? region.matcher : `|${region.matcher}`;
        config['proxy-groups'].push({
          ...groupBaseOption,
          name: region.name,
          type: 'url-test',
          interval: test_interval,
          tolerance: test_tolerance,
          use: providers,
          filter: region.matcher,
          icon: region.icon,
        });
      } else {
        config['proxy-groups'].push({
          ...groupBaseOption,
          name: region.name,
          type: 'url-test',
          use: providers,
          interval: test_interval,
          tolerance: test_tolerance,
          'exclude-filter': exclude,
          icon: region.icon,
        });
      }
      regions.push(region.name);
    }
  } else {
    let names = config.proxies.map((p) => p.name).filter(Boolean);
    if (names.length === 0) return;
    for (const region of regionConfig) {
      let proxies = [],
        noproxies = [];
      if (!region.matcher) {
        proxies = [...names];
        noproxies = [];
      } else {
        const matches = region.matcher.split('|');
        if (matches.length === 0) continue;
        const result = names.reduce(
          (acc, name) => {
            (matches.some((m) => name.includes(m))
              ? acc.proxies
              : acc.noproxies
            ).push(name);
            return acc;
          },
          { proxies: [], noproxies: [] }
        );
        proxies = result.proxies;
        noproxies = result.noproxies;
      }
      if (proxies.length === 0) continue;
      config['proxy-groups'].push({
        ...groupBaseOption,
        name: region.name,
        type: 'url-test',
        interval: test_interval,
        tolerance: test_tolerance,
        proxies: proxies,
        icon: region.icon,
      });
      regions.push(region.name);
      if (noproxies.length === 0) break;
      names = noproxies;
    }
  }
  if (regions.length === 0) return;
  const entries = config['proxy-groups'];
  for (const entry of entries) {
    if (!entry || !entry.proxies) continue;
    if (entry.name === '节点选择') {
      if (entry.proxies.length > 1) {
        entry.proxies.splice(2, 0, '地区选择');
      }
    } else if (entry.name === '全局直连') {
      entry.proxies.push('地区选择');
    } else if (
      entry.type === 'select' &&
      !entry.hasOwnProperty('include-all')
    ) {
      entry.proxies.push(...regions);
    }
  }
  if (entries.length > 0) {
    entries.splice(1, 0, {
      ...groupBaseOption,
      name: '地区选择',
      type: 'select',
      proxies: regions,
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/World_Map.png',
    });
  }
  config['proxy-groups'] = entries;
}

// 主函数
function main(config) {
  const proxyCount = config?.proxies?.length ?? 0;
  const proxyProviderCount =
    typeof config?.['proxy-providers'] === 'object'
      ? Object.keys(config['proxy-providers']).length
      : 0;
  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error('配置文件中未找到任何代理');
  }

  /**
   * 缓存
   */
  config['profile'] = {
    'store-selected': true,
    'store-fake-ip': true,
  };
  /**
   * 统一延迟
   * 开启统一延迟时，会计算 RTT，以消除连接握手等带来的不同类型节点的延迟差异
   * 可选值 true/false
   */
  config['unified-delay'] = true;
  /**
   * TCP 并发
   * 启用 TCP 并发连接，将会使用 dns 解析出的所有 IP 地址进行连接，使用第一个成功的连接
   * 可选值 true/false
   */
  config['tcp-concurrent'] = true;

  /**
   * 全局客户端指纹
   * 全局 TLS 指纹，优先低于 proxy 内的 client-fingerprint。
   * 目前支持开启 TLS 传输的 TCP/grpc/WS/HTTP , 支持协议有 VLESS,Vmess 和 trojan.
   * 可选：chrome, firefox, safari, ios, android, edge, 360, qq, random, 若选择 random, 则按 Cloudflare Radar 数据按概率生成一个现代浏览器指纹。
   */
  config['global-client-fingerprint'] = 'chrome';
  /**
   * GEO 文件加载模式
   * 可选的加载模式如下
    standard：标准加载器
    memconservative：专为内存受限 (小内存) 设备优化的加载器 (默认值)
   */
  config['geodata-loader'] = 'standard';
  // config['geosite-matcher'] = 'mph';
  /**
   * 自定全局 UA
   * 自定义外部资源下载时使用的的 UA，默认为 clash.meta
   */
  config['global-ua'] = 'chrome';
  /**
   * DNS配置
   */
  config['dns'] = dnsConfig;
  /**
   * 域名嗅探
   */
  config['sniffer'] = snifferConfig;
  /**
   * 代理组
   */
  config['proxy-groups'] = proxyGroups;
  /**
   * 规则集合
   */
  config['rule-providers'] = ruleProviders;
    /**
   * 规则
   */
  config['rules'] = rules;

  // 地区分组
  addRegions(config);

  // 返回修改后的配置
  return config;
}
