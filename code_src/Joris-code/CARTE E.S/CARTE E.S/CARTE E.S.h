#pragma once

#ifndef CARTE_ES_H
#define CARTE_ES_H

#include <boost/asio.hpp>
#include <boost/property_tree/ptree.hpp>
#include <boost/property_tree/json_parser.hpp>
#include <deque>
#include <iostream>
#include <chrono>
#include <thread>

using boost::asio::ip::tcp;

class CarteES {
public:
    CarteES(const std::string& serverAddress, int serverPort);

    void connectAndSend();

private:
    bool sendData(tcp::socket& socket);

    tcp::endpoint endpoint_;

    std::deque<std::string> dataQueue_;
};

#endif /* CARTE_ES_H */
