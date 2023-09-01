App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    // 判断是否有已经注入的web3实例
    if (typeof web3 !== "undefined") {
      App.web3Provider = web3.currentProvider;
    }
    // 如果没有已经注入的web3实例，则回调ganache并创建新的web3实例
    App.web3Provider = new Web3.providers.HttpProvider("http://localhost:7545")
    web3 = new Web3(App.web3Provider)

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Adoption.json', function(data) {
      // 获得必要的合约构建后的文件，并用truffle-contract初始化
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);
      // 为合约设定web3 provider
      App.contracts.Adoption.setProvider(App.web3Provider);
      // 使用合约来查询及标记以领养的宠物
      return App.markAdopted();
    })

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function(adopters, account) {
    var adoptionInstance;
    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance
      return adoptionInstance.getAdopters.call()
    }).then(function(adopters) {
      for(i = 0; i < adopters.length; i++) {
        // 如果该宠物有领养者，则页面显示“Success”
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    }) 
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;
        // 执行领养操作，指定交易账号为account
        return adoptionInstance.adopt(petId, {from: account});
      }).then(function(result) {
        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message)
      })
    })
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
